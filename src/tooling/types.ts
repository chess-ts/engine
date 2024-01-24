
// Coordinates types
/**
 * A coordinate : 0-7
 */
export type Coord = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
/**
 * A set of coordinates : [0-7, 0-7]
 */
export type Coords = [Coord, Coord];

// Piece types
/**
 * A piece type : { pawn, knight, bishop, rook, queen, king }
 */
export type PieceType = 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';
export type PieceColor = 'white' | 'black';
export type Piece = {
	type: PieceType,
	color: PieceColor,
};

// Bitboard types
/**
 * A bitboard for a color : { pawn, knight, bishop, rook, queen, king }
 */
export type ColorBitboard = {
	[key in PieceType]: bigint
};
/**
 * Bitboards for both colors : { white, black }
 */
export interface Bitboards {
	white: ColorBitboard,
	black: ColorBitboard,
};