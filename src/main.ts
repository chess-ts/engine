import Board from './Board.ts';
import { MK_FILTER_REPR } from './tooling/macros.ts';

const board = new Board();

console.log(JSON.stringify(
	MK_FILTER_REPR(
		board.get_color_filter('black')
	),
	null,
	2
));