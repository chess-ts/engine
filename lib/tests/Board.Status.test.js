import { assertEquals } from 'https://deno.land/std@0.214.0/assert/mod.ts';
import { Board } from '../board/Board.ts';
Deno.test('Board.Status is "ongoing" for the starting position', () => {
    const board = new Board();
    assertEquals(board.Move([1, 0], [3, 0])?.status, 'ongoing');
});
Deno.test('Board.Status is "checkmate" if the game is over and the king is in check', () => {
    const board = new Board('k6R/7R/8/8/8/8/8/K7');
    assertEquals(board.Move([0, 0], [0, 1])?.status, 'checkmate');
});
Deno.test('Board.Status is "stalemate" if the game is over and the king is not in check', () => {
    const board = new Board('k7/7R/8/8/8/8/8/KR6');
    assertEquals(board.Move([0, 0], [1, 0]).reason, 'stalemate');
});
Deno.test('Board.Status is "fifty" if the game is over and there were 50 moves without a pawn move or a capture', () => {
    const board = new Board('k7/p7/8/8/8/8/P7/K7');
    board.Move([0, 0], [0, 1]);
    board.Move([7, 0], [7, 1]);
    board.Move([0, 1], [0, 2]);
    board.Move([7, 1], [7, 2]);
    board.Move([0, 2], [0, 3]);
    board.Move([7, 2], [7, 3]);
    board.Move([0, 3], [0, 4]);
    board.Move([7, 3], [7, 4]);
    board.Move([0, 4], [0, 5]);
    board.Move([7, 4], [7, 5]);
    board.Move([0, 5], [0, 6]);
    board.Move([7, 5], [7, 6]);
    board.Move([0, 6], [0, 7]);
    board.Move([7, 6], [7, 7]);
    board.Move([0, 7], [1, 7]);
    board.Move([7, 7], [6, 7]);
    board.Move([1, 7], [1, 6]);
    board.Move([6, 7], [6, 6]);
    board.Move([1, 6], [1, 5]);
    board.Move([6, 6], [6, 5]);
    board.Move([1, 5], [1, 4]);
    board.Move([6, 5], [6, 4]);
    board.Move([1, 4], [1, 3]);
    board.Move([6, 4], [6, 3]);
    board.Move([1, 3], [1, 2]);
    board.Move([6, 3], [6, 2]);
    board.Move([1, 2], [1, 1]);
    board.Move([6, 2], [6, 1]);
    board.Move([1, 1], [2, 0]);
    board.Move([6, 1], [5, 0]);
    board.Move([2, 0], [2, 1]);
    board.Move([5, 0], [5, 1]);
    board.Move([2, 1], [2, 2]);
    board.Move([5, 1], [5, 2]);
    board.Move([2, 2], [2, 3]);
    board.Move([5, 2], [5, 3]);
    board.Move([2, 3], [2, 4]);
    board.Move([5, 3], [5, 4]);
    board.Move([2, 4], [2, 5]);
    board.Move([5, 4], [5, 5]);
    board.Move([2, 5], [2, 6]);
    board.Move([5, 5], [5, 6]);
    board.Move([2, 6], [2, 7]);
    board.Move([5, 6], [5, 7]);
    board.Move([2, 7], [2, 6]);
    board.Move([5, 7], [5, 6]);
    board.Move([2, 6], [2, 5]);
    board.Move([5, 6], [5, 5]);
    board.Move([2, 5], [2, 4]);
    board.Move([5, 5], [5, 4]);
    assertEquals(board.Move([2, 4], [2, 3]).reason, 'fifty');
});
Deno.test('Board.Status is "threefold" if the game is over and it\'s a draw', () => {
    const board = new Board('k7/p7/8/8/8/8/P7/K7');
    board.Move([0, 0], [0, 1]);
    board.Move([7, 0], [7, 1]);
    board.Move([0, 1], [0, 0]);
    board.Move([7, 1], [7, 0]);
    board.Move([0, 0], [0, 1]);
    board.Move([7, 0], [7, 1]);
    board.Move([0, 1], [0, 0]);
    board.Move([7, 1], [7, 0]);
    board.Move([0, 0], [0, 1]);
    board.Move([7, 0], [7, 1]);
    board.Move([0, 1], [0, 0]);
    assertEquals(board.Move([7, 1], [7, 0]).reason, 'threefold');
});
Deno.test('Board.Status is "insufficient" if the game is over and it\'s a draw', () => {
    const board = new Board('k7/8/8/8/8/8/8/K7');
    assertEquals(board.Move([0, 0], [1, 0]).reason, 'insufficient');
});
