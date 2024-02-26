import { MK_PAWN, MK_KNIGHT, MK_BISHOP, MK_ROOK, MK_QUEEN, MK_KING, MK_MOVE, MK_PIECE, } from '../tooling/macros.ts';
export class Board {
    /**
     * The board representation
     */
    board;
    _last_move = null;
    get last_move() {
        return this._last_move;
    }
    move_count = 0;
    _move_history = [];
    get move_history() {
        return this._move_history;
    }
    /**
     * Set the board from a FEN string
     * @param fen The FEN string
     * @returns The board representation
     */
    FENtoBoard(fen) {
        const board = [
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null]
        ];
        let x = 0;
        let y = 0;
        for (const c of fen) {
            if (c === '/') {
                y = 0;
                x++;
            }
            else if (c === '8') {
                continue;
            }
            else if (!isNaN(parseInt(c)) && c !== '0') {
                y += parseInt(c);
            }
            else {
                const is_white = c === c.toUpperCase();
                switch (c) {
                    case 'p':
                    case 'P':
                        board[x][7 - y] = MK_PAWN(is_white ? 'white' : 'black');
                        break;
                    case 'n':
                    case 'N':
                        board[x][7 - y] = MK_KNIGHT(is_white ? 'white' : 'black');
                        break;
                    case 'b':
                    case 'B':
                        board[x][7 - y] = MK_BISHOP(is_white ? 'white' : 'black');
                        break;
                    case 'r':
                    case 'R':
                        board[x][7 - y] = MK_ROOK(is_white ? 'white' : 'black');
                        break;
                    case 'q':
                    case 'Q':
                        board[x][7 - y] = MK_QUEEN(is_white ? 'white' : 'black');
                        break;
                    case 'k':
                    case 'K':
                        board[x][7 - y] = MK_KING(is_white ? 'white' : 'black');
                        break;
                    default:
                        throw new Error(`Unknown piece ${c}`);
                }
                y++;
            }
        }
        return board;
    }
    /**
     * Creates a new board
     * @param fen The FEN string to set the board to
     */
    constructor(fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR') {
        this.board = this.FENtoBoard(fen.split('').reverse().join(''));
    }
    FindPiece(filters) {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const piece = this.board[i][j];
                if (piece && piece.type === filters.type && piece.color === filters.color) {
                    return [i, j];
                }
            }
        }
    }
    IsTargeted(color, pos) {
        for (const move of this.GetColorMoves(color === 'white' ? 'black' : 'white', true)) {
            if (move.to[0] === pos[0] && move.to[1] === pos[1]) {
                return true;
            }
        }
        return false;
    }
    //#region Get Moves
    /**
     * Get all possible moves for a pawn
     * @param coords The coordinates of the pawn
     * @param color The color of the pawn
     * @returns An array of coordinates
     */
    GetMovesPawn(coords, color) {
        const moves = [];
        const direction = color === 'white' ? 1 : -1;
        const end = coords[0] + direction;
        if (end >= 0 && end < 8) {
            if (!this.board[end][coords[1]]) {
                moves.push(MK_MOVE(coords, [end, coords[1]], false, false, "none", (end === 7 || end === 0) ? 'queen' : 'none'));
                if (end + direction >= 0 && end + direction < 8 && !this.board[end + direction][coords[1]] && !this.board[coords[0]][coords[1]]?.moved) {
                    moves.push(MK_MOVE(coords, [end + direction, coords[1]]));
                }
            }
            if (this.board[end][coords[1] + 1] && this.board[end][coords[1] + 1]?.color !== color) {
                moves.push(MK_MOVE(coords, [end, coords[1] + 1], true, false, "none", (end === 7 || end === 0) ? 'queen' : 'none'));
            }
            if (this.board[end][coords[1] - 1] && this.board[end][coords[1] - 1]?.color !== color) {
                moves.push(MK_MOVE(coords, [end, coords[1] - 1], true, false, "none", (end === 7 || end === 0) ? 'queen' : 'none'));
            }
            if (coords[0] === (color === 'white' ? 4 : 3) && this._last_move) {
                const piece = this.board[this._last_move.to[0]][this._last_move?.to[1]];
                if ((this._last_move?.from[1] === coords[1] + 1 || this._last_move?.from[1] === coords[1] - 1) &&
                    this._last_move?.to[0] === coords[0] &&
                    piece &&
                    piece.type === 'pawn' &&
                    piece.color !== color) {
                    moves.push(MK_MOVE(coords, [end, this._last_move.to[1]], true, true));
                }
            }
        }
        return moves;
    }
    /**
     * Get all possible moves for a knight
     * @param coords The coordinates of the knight
     * @returns An array of coordinates
     */
    GetMovesKnight(coords) {
        const knight_offsets = [
            [1, 2], [2, 1],
            [-1, 2], [-2, 1],
            [1, -2], [2, -1],
            [-1, -2], [-2, -1]
        ];
        return knight_offsets.map((offset) => [coords[0] + offset[0], coords[1] + offset[1]]).filter((dest) => dest[0] >= 0 && dest[0] < 8 && dest[1] >= 0 && dest[1] < 8).filter((dest) => this.board[dest[0]][dest[1]] === null || this.board[dest[0]][dest[1]]?.color !== this.board[coords[0]][coords[1]]?.color).map((dest) => this.board[dest[0]][dest[1]] && this.board[dest[0]][dest[1]]?.color !== this.board[coords[0]][coords[1]]?.color ? MK_MOVE(coords, dest, true) : MK_MOVE(coords, dest));
    }
    /**
     * Get all possible moves for a bishop
     * @param coords The coordinates of the bishop
     * @returns An array of coordinates
     */
    GetMovesBishop(coords) {
        const moves = [];
        for (let i = 1; i < 8; i++) {
            if (coords[0] + i < 8 && coords[1] + i < 8) {
                const piece = this.board[coords[0] + i][coords[1] + i];
                if (piece) {
                    if (piece.color !== this.board[coords[0]][coords[1]]?.color) {
                        moves.push(MK_MOVE(coords, [coords[0] + i, coords[1] + i], true));
                    }
                    break;
                }
                moves.push(MK_MOVE(coords, [coords[0] + i, coords[1] + i]));
            }
            else {
                break;
            }
        }
        for (let i = 1; i < 8; i++) {
            if (coords[0] + i < 8 && coords[1] - i >= 0) {
                const piece = this.board[coords[0] + i][coords[1] - i];
                if (piece) {
                    if (piece.color !== this.board[coords[0]][coords[1]]?.color) {
                        moves.push(MK_MOVE(coords, [coords[0] + i, coords[1] - i], true));
                    }
                    break;
                }
                moves.push(MK_MOVE(coords, [coords[0] + i, coords[1] - i]));
            }
            else {
                break;
            }
        }
        for (let i = 1; i < 8; i++) {
            if (coords[0] - i >= 0 && coords[1] + i < 8) {
                const piece = this.board[coords[0] - i][coords[1] + i];
                if (piece) {
                    if (piece.color !== this.board[coords[0]][coords[1]]?.color) {
                        moves.push(MK_MOVE(coords, [coords[0] - i, coords[1] + i], true));
                    }
                    break;
                }
                moves.push(MK_MOVE(coords, [coords[0] - i, coords[1] + i]));
            }
            else {
                break;
            }
        }
        for (let i = 1; i < 8; i++) {
            if (coords[0] - i >= 0 && coords[1] - i >= 0) {
                const piece = this.board[coords[0] - i][coords[1] - i];
                if (piece) {
                    if (piece.color !== this.board[coords[0]][coords[1]]?.color) {
                        moves.push(MK_MOVE(coords, [coords[0] - i, coords[1] - i], true));
                    }
                    break;
                }
                moves.push(MK_MOVE(coords, [coords[0] - i, coords[1] - i]));
            }
            else {
                break;
            }
        }
        return moves;
    }
    /**
     * Get all possible moves for a rook
     * @param coords The coordinates of the rook
     * @returns An array of coordinates
     */
    GetMovesRook(coords) {
        const moves = [];
        for (let i = coords[0] - 1; i >= 0; i--) {
            const piece = this.board[i][coords[1]];
            if (piece) {
                if (piece.color !== this.board[coords[0]][coords[1]]?.color) {
                    moves.push(MK_MOVE(coords, [i, coords[1]], true));
                }
                break;
            }
            moves.push(MK_MOVE(coords, [i, coords[1]]));
        }
        for (let i = coords[0] + 1; i < 8; i++) {
            const piece = this.board[i][coords[1]];
            if (piece) {
                if (piece.color !== this.board[coords[0]][coords[1]]?.color) {
                    moves.push(MK_MOVE(coords, [i, coords[1]], true));
                }
                break;
            }
            moves.push(MK_MOVE(coords, [i, coords[1]]));
        }
        for (let i = coords[1] - 1; i >= 0; i--) {
            const piece = this.board[coords[0]][i];
            if (piece) {
                if (piece.color !== this.board[coords[0]][coords[1]]?.color) {
                    moves.push(MK_MOVE(coords, [coords[0], i], true));
                }
                break;
            }
            moves.push(MK_MOVE(coords, [coords[0], i]));
        }
        for (let i = coords[1] + 1; i < 8; i++) {
            const piece = this.board[coords[0]][i];
            if (piece) {
                if (piece.color !== this.board[coords[0]][coords[1]]?.color) {
                    moves.push(MK_MOVE(coords, [coords[0], i], true));
                }
                break;
            }
            moves.push(MK_MOVE(coords, [coords[0], i]));
        }
        return moves;
    }
    /**
     * Get all possible moves for a queen
     * @param coords The coordinates of the queen
     * @returns An array of coordinates
     */
    GetMovesQueen(coords) {
        return this.GetMovesBishop(coords).concat(this.GetMovesRook(coords));
    }
    /**
     * Get all possible moves for a king
     * @param coords The coordinates of the king
     * @param ignore Whether to ignore if the move would put the king in check (castling only)
     * @returns An array of coordinates
     */
    GetMovesKing(coords, ignore = false) {
        const moves = [];
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if ((i !== 0 || j !== 0) &&
                    coords[0] + i >= 0 && coords[0] + i < 8 &&
                    coords[1] + j >= 0 && coords[1] + j < 8) {
                    const piece = this.board[coords[0] + i][coords[1] + j];
                    if (piece) {
                        if (piece.color !== this.board[coords[0]][coords[1]]?.color) {
                            moves.push(MK_MOVE(coords, [coords[0] + i, coords[1] + j], true));
                        }
                    }
                    else {
                        moves.push(MK_MOVE(coords, [coords[0] + i, coords[1] + j]));
                    }
                }
            }
        }
        if (!ignore) {
            if (this.CanCastle(this.board[coords[0]][coords[1]]?.color, 'king')) {
                moves.push(MK_MOVE(coords, [coords[0], 6], false, false, 'king'));
            }
            if (this.CanCastle(this.board[coords[0]][coords[1]]?.color, 'queen')) {
                moves.push(MK_MOVE(coords, [coords[0], 2], false, false, 'queen'));
            }
        }
        return moves;
    }
    //#endregion
    //#region Castling
    CanCastle(color, side) {
        const krank = color === 'white' ? 0 : 7;
        const king = this.board[krank][4];
        const rook = this.board[krank][side === 'king' ? 7 : 0];
        if (king && rook &&
            king.type === 'king' && rook.type === 'rook' &&
            !king.moved && !rook.moved &&
            !this.IsCheck(color)) {
            for (let i = 1; i < 3; i++) {
                if (this.board[krank][side === 'king' ? 4 + i : 4 - i] || // Piece in the way
                    this.IsTargeted(color, [krank, side === 'king' ? 4 + i : 4 - i]) // Targeted square
                ) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }
    //#endregion
    //#region Game State
    /**
     * Check if a color is in check
     * @param color The color to check
     * @returns Whether the color is in check
     */
    IsCheck(color) {
        const king_coords = this.FindPiece({ type: 'king', color });
        if (!king_coords) {
            throw new Error('No king found');
        }
        const moves = this.GetColorMoves(color === 'white' ? 'black' : 'white', true);
        for (const move of moves) {
            if (move.to[0] === king_coords[0] && move.to[1] === king_coords[1]) {
                return true;
            }
        }
        return false;
    }
    /**
     * Check if a color is in checkmate
     * @param color The color to check
     * @returns Whether the color is in checkmate
     */
    IsCheckmate(color) {
        const moves = this.GetColorMoves(color);
        return moves.length === 0 && this.IsCheck(color);
    }
    /**
     * Check if a move would put the king in check
     * @param move The move to check
     * @returns Whether the move would put the king in check
    */
    WouldBeCheck(move) {
        if (move.castle !== 'none') {
            return false;
        }
        const tmp = structuredClone(this.board);
        const last = structuredClone(this._last_move);
        const move_count = this.move_count;
        const move_history = structuredClone(this._move_history);
        const piece = tmp[move.from[0]][move.from[1]];
        this.Move(move.from, move.to, 'queen', true);
        const check = this.IsCheck(piece?.color);
        this.board = tmp;
        this._last_move = last;
        this.move_count = move_count;
        this._move_history = move_history;
        return check;
    }
    /**
     * Check if a color is in stalemate
     * @param color The color to check
     * @returns Whether the color is in stalemate
     */
    IsStalemate(color) {
        const moves = this.GetColorMoves(color, false);
        return moves.length === 0 && !this.IsCheck(color);
    }
    /**
     * Check if the move count is greater than 50
     * @returns Whether the move count is greater than 50
     */
    IsFiftyMoveRule() {
        return this.move_count >= 50;
    }
    /**
     * Check if the game is in a threefold repetition
     * @returns Whether the game is in a threefold repetition
     */
    IsThreefoldRepetition() {
        const buffer = [];
        for (let i = this._move_history.length - 1; i >= 0; i--) {
            const reverse_buffer = Array.from(buffer).reverse();
            if (JSON.stringify(this._move_history[i]) === JSON.stringify(buffer[0]) &&
                JSON.stringify(reverse_buffer) === JSON.stringify(this._move_history.slice(-buffer.length * 2, -buffer.length)) &&
                JSON.stringify(reverse_buffer) === JSON.stringify(this._move_history.slice(-buffer.length * 3, -buffer.length * 2))) {
                return true;
            }
            else {
                buffer.push(this._move_history[i]);
            }
        }
        return false;
    }
    /**
     * Check if the game is in a state of insufficient material
     * @returns Whether the game is in a state of insufficient material
     */
    IsInsufficientMaterial() {
        const minor_pieces = {
            'white': 0,
            'black': 0
        };
        for (const piece of this.board.flat()) {
            if (piece && (piece.type === 'rook' || piece.type === 'queen' || piece.type === 'pawn')) {
                return false;
            }
            else if (piece && (piece.type === 'knight' || piece.type === 'bishop')) {
                if (minor_pieces[piece.color] === 1) {
                    return false;
                }
                minor_pieces[piece.color]++;
            }
        }
        return true;
    }
    /**
     * Get the status of the game
     * @returns The status of the game
     * {@link Status}
     */
    GetStatus() {
        if (this.IsCheckmate('white')) {
            return { status: 'checkmate', winner: 'black' };
        }
        else if (this.IsCheckmate('black')) {
            return { status: 'checkmate', winner: 'white' };
        }
        else if (this.IsCheck('white')) {
            return { status: 'ongoing', check: 'white' };
        }
        else if (this.IsCheck('black')) {
            return { status: 'ongoing', check: 'black' };
        }
        else if (this.IsStalemate('white') || this.IsStalemate('black')) {
            return { status: 'draw', reason: 'stalemate' };
        }
        else if (this.IsFiftyMoveRule()) {
            return { status: 'draw', reason: 'fifty' };
        }
        else if (this.IsThreefoldRepetition()) {
            return { status: 'draw', reason: 'threefold' };
        }
        else if (this.IsInsufficientMaterial()) {
            return { status: 'draw', reason: 'insufficient' };
        }
        else {
            return { status: 'ongoing', check: 'none' };
        }
    }
    //#endregion
    //#region Public Functions
    /**
     * Get all possible moves for a piece
     *
     * ## Usage
     * ```ts
     * // Create a new instance of a board
     * const board = new Board();
     * // Get all moves for the piece at [0, 0]
     * const moves = board.GetMoves([0, 0]);
     * ```
     * @param coords The coordinates of the piece [0-7, 0-7]
     * @param ignore Whether to ignore if the move would put the king in check
     * @returns An array of moves
     */
    GetMoves(coords, ignore = false) {
        const moves = [];
        const piece = this.board[coords[0]][coords[1]];
        if (piece !== null) {
            switch (piece.type) {
                case 'pawn':
                    moves.push(...this.GetMovesPawn(coords, piece.color));
                    break;
                case 'knight':
                    moves.push(...this.GetMovesKnight(coords));
                    break;
                case 'bishop':
                    moves.push(...this.GetMovesBishop(coords));
                    break;
                case 'rook':
                    moves.push(...this.GetMovesRook(coords));
                    break;
                case 'queen':
                    moves.push(...this.GetMovesQueen(coords));
                    break;
                case 'king':
                    moves.push(...this.GetMovesKing(coords, ignore));
            }
            if (ignore) {
                return moves;
            }
            return moves.filter(move => !this.WouldBeCheck(move));
        }
        return moves;
    }
    /**
     * Get all possible moves for a color
     *
     * ## Usage
     * ```ts
     * // Create a new instance of a board
     * const board = new Board();
     * // Get all moves for white
     * const moves = board.GetColorMoves('white');
     * ```
     * @param color The color of the pieces (white | black)
     * @param ignore Whether to ignore if the move would put the king in check
     * @returns An array of moves
     */
    GetColorMoves(color, ignore = false) {
        const moves = [];
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const piece = this.board[i][j];
                if (piece && piece.color === color) {
                    if (piece.type === 'king' && ignore) {
                        moves.push(...this.GetMovesKing([i, j], ignore));
                    }
                    moves.push(...this.GetMoves([i, j], ignore));
                }
            }
        }
        return moves;
    }
    /**
     * Move a piece from a position to another
     *
     * ## Usage
     * ```ts
     * // Create a new instance of a board
     * const board = new Board();
     * // Move the piece at [1, 0] to [2, 0]
     * const status = board.Move([1, 0], [2, 0]);
     * ```
     * @param from The position of the piece to move
     * @param to The position to move the piece to
     * @param promotion The type of piece to promote to
     * @param ignore Whether to ignore if the move would put the king in check
     * @returns The status of the game after the move
     * @throws "Invalid Move" If the move is invalid
     * @throws "No piece at this position" If there is no piece at the position
     */
    Move(from, to, promotion = 'queen', ignore = false) {
        const piece = this.board[from[0]][from[1]];
        if (piece) {
            for (const mv of this.GetMoves(from, ignore)) {
                if (mv.to[0] === to[0] && mv.to[1] === to[1]) {
                    this.board[to[0]][to[1]] = piece;
                    if (mv.enPassant) {
                        this.board[to[0] + (piece.color === 'white' ? -1 : 1)][to[1]] = null;
                    }
                    if (mv.castle !== 'none') {
                        const rook = this.board[to[0]][mv.castle === 'king' ? 7 : 0];
                        this.board[to[0]][mv.castle === 'king' ? 5 : 3] = rook;
                        this.board[to[0]][mv.castle === 'king' ? 7 : 0] = null;
                    }
                    if (mv.promotion !== 'none') {
                        this.board[to[0]][to[1]] = MK_PIECE(piece.color, promotion);
                    }
                    this.board[from[0]][from[1]] = null;
                    piece.moved = true;
                    this._last_move = mv;
                    this._move_history.push(mv);
                    this.move_count++;
                    if (piece.type === 'pawn' || mv.capture) {
                        this.move_count = 0;
                    }
                    return ignore ? null : this.GetStatus();
                }
            }
            throw new Error('Invalid move');
        }
        throw new Error('No piece at this position');
    }
    GetFen() {
        let fen = '';
        for (const rank of Array.from(this.board).reverse()) {
            let empty = 0;
            for (const cell of rank) {
                if (cell === null) {
                    empty++;
                }
                else {
                    if (empty > 0) {
                        fen += empty;
                        empty = 0;
                    }
                    fen += cell.type === 'knight' ? cell.color === 'white' ? 'N' : 'n' : cell.color === 'white' ? cell.type.toUpperCase()[0] : cell.type.toLowerCase()[0];
                }
            }
            if (empty > 0) {
                fen += empty;
            }
            fen += '/';
        }
        return fen.slice(0, -1);
    }
    SetUCI(uci) {
        if (uci === '') {
            return;
        }
        for (const move of uci.split(' ')) {
            const from = [parseInt(move[1]) - 1, move.charCodeAt(0) - 97];
            const to = [parseInt(move[3]) - 1, move.charCodeAt(2) - 97];
            const promotion_table = { 'q': 'queen', 'r': 'rook', 'b': 'bishop', 'n': 'knight' };
            const promotion = (move[4] ? promotion_table[move[4]] : 'none');
            this.Move(from, to, promotion);
        }
    }
    GetUCI() {
        const moves = this._move_history.map(move => {
            const from = String.fromCharCode(move.from[1] + 97) + (move.from[0] + 1);
            const to = String.fromCharCode(move.to[1] + 97) + (move.to[0] + 1);
            return from + to + (move.promotion !== 'none' ? move.promotion[0] : '');
        });
        return moves.join(' ');
    }
    //#endregion
    //#region CLI Utils
    /**
     * Get a string representation of the board
     * @returns A string representation of the board
     */
    ToString() {
        let pretty = '';
        pretty += '  a b c d e f g h\n';
        for (const rank of [...this.board].reverse()) {
            pretty += `${this.board.indexOf(rank) + 1} `;
            for (const cell of rank) {
                pretty += cell === null ? '.' : cell.type === 'knight' ? cell.color === 'white' ? 'N' : 'n' : cell.color === 'white' ? cell.type.toUpperCase()[0] : cell.type.toLowerCase()[0];
                pretty += ' ';
            }
            pretty += '\n';
        }
        pretty += '\n';
        pretty += this.CanCastle('white', 'king') ? 'White can castle kingside\n' : '';
        pretty += this.CanCastle('white', 'queen') ? 'White can castle queenside\n' : '';
        pretty += this.CanCastle('black', 'king') ? 'Black can castle kingside\n' : '';
        pretty += this.CanCastle('black', 'queen') ? 'Black can castle queenside\n' : '';
        return pretty;
    }
    GodMode(command) {
        const [color, piece, x, y] = command.split(' ').slice(1);
        switch (command.split(' ')[0]) {
            case 'put':
                this.board[parseInt(x)][parseInt(y)] = {
                    color: color,
                    type: piece,
                    moved: false
                };
                break;
        }
    }
}
;
