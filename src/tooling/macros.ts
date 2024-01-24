import { Coords } from './types.ts'

/**
 * Macro to create a filter from a list of coordinates
 * @param coords The coordinates to create the filter from
 * @returns The filter
 */
export const MK_FILTER = (coords: Coords[]): bigint => {
	let filter = 0n;
	for(const coord of coords) {
		filter |= 1n << BigInt(coord[0] * 8 + coord[1]);
	}
	return filter;
}

/**
 * Macro to create a human-readable representation of a filter
 * @param filter The filter to create the representation from
 * @returns The representation
 */
export const MK_FILTER_REPR = (filter: bigint): boolean[][] => {
	const repr: boolean[][] = [];
	for(let i = 0; i < 8; i++) {
		repr.push([]);
		for(let j = 0; j < 8; j++) {
			repr[i].push(!!((filter >> BigInt(i * 8 + j)) & 1n));
		}
	}
	return repr;
}