import {
	Coords,
	PieceType,
	PieceColor,
	Piece,
	ColorBitboard,
	Bitboards,
} from './tooling/types.ts';
import { MK_FILTER } from './tooling/macros.ts';

/**
 * The board class
 */
export default class Board {

	private meta = {

	}

	/**
	 * The bitboards for the board
	 * 
	 * Each color has a bitboard for each piece type
	 */
	private bitboards: Bitboards;

	public constructor() {
		// Setup the default bitboards
		this.bitboards = {
			white: {
				pawn: MK_FILTER(
					[[1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7]]
				),
				knight: MK_FILTER(
					[[0, 1], [0, 6]]
				),
				bishop: MK_FILTER(
					[[0, 2], [0, 5]]
				),
				rook: MK_FILTER(
					[[0, 0], [0, 7]]
				),
				queen: MK_FILTER(
					[[0, 3]]
				),
				king: MK_FILTER(
					[[0, 4]]
				)
			},
			black: {
				pawn: MK_FILTER(
					[[6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [6, 6], [6, 7]]
				),
				knight: MK_FILTER(
					[[7, 1], [7, 6]]
				),
				bishop: MK_FILTER(
					[[7, 2], [7, 5]]
				),
				rook: MK_FILTER(
					[[7, 0], [7, 7]]
				),
				queen: MK_FILTER(
					[[7, 3]]
				),
				king: MK_FILTER(
					[[7, 4]]
				)
			}
		}
	}

	public get_color_bitboard = (color: PieceColor): bigint => {
		return this.bitboards[color].pawn | this.bitboards[color].knight | this.bitboards[color].bishop | this.bitboards[color].rook | this.bitboards[color].queen | this.bitboards[color].king;
	}

	public get_pos(piece: PieceType, color: PieceColor): bigint {
		return this.bitboards[color][piece];
	}

	public get_piece = (coords: Coords): Piece | null => {
		for(const [color_key, color] of Object.entries(this.bitboards) as [string, ColorBitboard][]) {
			for(const [key, piece] of Object.entries(color)) {
				if(piece & 1n << BigInt(coords[0] * 8 + coords[1])) {
					return {
						type: key as PieceType,
						color: color_key as PieceColor,
					};
				}
			}
		}
		return null;
	
	}

	public get_moves = (from: Coords): Coords[] => {
		const piece = this.get_piece(from);
		if(!piece) {
			throw new Error('No piece found at the specified coordinates');
		}
		const moves = [] as Coords[];

		// Get legal moves

		return moves;
	}

	public move_piece = (from: Coords, to: Coords): void => {
		const piece = this.get_piece(from) as Piece; // Ignore the null case, it's handled by get_moves
		for(const move of this.get_moves(from)) {
			if(move[0] === to[0] && move[1] === to[1]) {
				this.bitboards[piece.color][piece.type] &= ~(1n << BigInt(from[0] * 8 + from[1]));
				this.bitboards[piece.color][piece.type] |= 1n << BigInt(to[0] * 8 + to[1]);
				return;
			}
		}
	}
}