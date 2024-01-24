
import Coords from "./Coords.ts";
import { uniquePairs } from "./helpers.ts";

/**
 * A bitboard
 */
export type Bitboard = bigint;

//#region Bitboard Constants

/**
 * The empty set (0)
 */
export const EMPTY_SET: Bitboard = 0n;
/**
 * The universe set (2^64 - 1)
 */
export const UNIVERSE_SET: Bitboard = BigInt(2 ** 64 - 1);

/**
 * The set of all squares not on the first rank
 */
export const notAFile = 0xfefefefefefefefen;

/**
 * The set of all squares not on the eighth rank
 */
export const notHFile = 0x7f7f7f7f7f7f7f7fn;

//#endregion

//#region Bitboard Bitwise Operations

/**
 * Get the intersection of two bitboards
 * 
 * ### Notation
 * `a ∩ b`
 * 
 * ### Implementation
 * 
 * ```ts
 * a & b
 * ```
 * 
 * ### Explanation
 * Allows to get all the common bits between two bitboards
 * @param a The first bitboard
 * @param b The second bitboard
 * @returns The intersection of the two bitboards
 */
export const Intersection = (a: Bitboard, b: Bitboard): Bitboard => a & b;

/**
 * Get the union of two bitboards
 * 
 * ### Notation
 * `a ∪ b`
 * 
 * ### Implementation
 * 
 * ```ts
 * a | b
 * ```
 * 
 * ### Explanation
 * Allows to get all the bits that are in at least one of the two bitboards
 * @param a The first bitboard
 * @param b The second bitboard
 * @returns The union of the two bitboards
 */
export const Union = (a: Bitboard, b: Bitboard): Bitboard => a | b;

/**
 * Get the complement of a bitboard
 * 
 * ### Notation
 * `¬a`
 * 
 * ### Implementation
 * ```ts
 * ~a;
 * ```
 * 
 * ### Explanation
 * Allows to get all the bits that are not in the bitboard
 * @param a The bitboard
 * @returns The complement of the bitboard
 */
export const Complement = (a: Bitboard): Bitboard => ~a;

/**
 * Get the relative complement of two bitboards
 * 
 * ### Notation
 * `a \ b`
 * 
 * ### Implementation
 * ```ts
 * Intersection(a, Complement(b));
 * ```
 * 
 * ### Explanation
 * Allows to get all the bits that are in the first bitboard but not in the second
 * @param a The first bitboard
 * @param b The second bitboard
 * @returns The relative complement of the two bitboards
 */
export const RelativeComplement = (a: Bitboard, b: Bitboard): Bitboard => Intersection(a, Complement(b));

/**
 * Get the implication of two bitboards
 * 
 * ### Notation
 * `a → b`
 * 
 * ### Implementation
 * ```ts
 * RelativeComplement(b, a);
 * ```
 * 
 * ### Explanation 
 * Allows to get all the bits that are in the second bitboard or not in the first
 * @param a The first bitboard
 * @param b The second bitboard
 * @returns The implication of the two bitboards
 */
export const Implication = (a: Bitboard, b: Bitboard): Bitboard => RelativeComplement(b, a);

/**
 * Get the exclusive or of two bitboards
 * 
 * ### Notation
 * `a ⊕ b`
 * 
 * ### Implementation
 * ```ts
 * a ^ b;
 * ```
 * ### Explanation
 * Allows to get all the bits that are in one of the two bitboards but not in both
 * 
 * @param a The first bitboard
 * @param b The second bitboard
 * @returns The exclusive or of the two bitboards
 */
export const XOR = (a: Bitboard, b: Bitboard): Bitboard => a ^ b;

/**
 * Get the equivalence of two bitboards
 * 
 * ### Notation
 * `a ↔ b`
 * 
 * ### Implementation
 * ```ts
 * Complement(XOR(a, b));
 * ```
 * 
 * ### Explanation
 * Allows to get all the bits that are in both bitboards or in none of them
 * @param a The first bitboard
 * @param b The second bitboard
 * @returns The equivalence of the two bitboards
 */
export const Equivalence = (a: Bitboard, b: Bitboard): Bitboard => Complement(XOR(a, b));

/**
 * Get the majority of three bitboards
 * 
 * ### Notation
 * `maj(a, b, c)`
 * 
 * ### Implementation
 * ```ts
 * Union(Union(Intersection(a, b), Intersection(b, c)), Intersection(c, a));
 * ```
 * 
 * ### Explanation 
 * Allows to get whether at least half of the bitboards are true for each bit
 * @param a The first bitboard
 * @param b The second bitboard
 * @param c The third bitboard
 * @returns The majority of the three bitboards
 */
export const Majority = (a: Bitboard, b: Bitboard, c: Bitboard): Bitboard =>
	Union(
		Union(
			Intersection(a, b),
			Intersection(b, c)
			),
		Intersection(c, a)
	);

/**
 * Get the greater one of a list of bitboards
 * 
 * ### Notation
 * `∪i>j∈I(Ai ∩ Aj)`
 * 
 * ### Implementation
 * ```ts
 *	let result = EMPTY_SET;
 *	for(const pair of uniquePairs(bitboards)) {
 *		result = Union(result, Intersection(pair[0], pair[1]));
 *	}
 *	return result;
 *	```
 *
 * ### Explanation
 * Allows to get all the bits that are in at least two of the bitboards
 * @param bitboards 
 * @returns The greater one of the bitboards
 */
export const GreaterOne = (...bitboards: Bitboard[]): Bitboard => {
	if(bitboards.length === 0) { throw new Error('GreaterOne: No bitboards provided'); }
	let result = EMPTY_SET;
	for(const pair of uniquePairs(bitboards)) {
		result = Union(result, Intersection(pair[0], pair[1]));
	}
	return result;
}

//#endregion

//#region Bitboard One-Step Shifts

/**
 * Get an offset bitboard by one square to the south
 * 
 * ### Notation
 * `a >> 8`
 * 
 * ### Implementation
 * ```ts
 * a >> 8n;
 * ```
 * 
 * ### Explanation
 * Allows to get a bitboard with every bit offset by one square to the south
 * @param bitboard The bitboard to offset
 * @returns The offset bitboard
 */
export const soutOne = (bitboard: Bitboard): Bitboard => bitboard >> 8n;

/**
 * Get an offset bitboard by one square to the north
 * 
 * ### Notation
 * `a << 8`
 * 
 * ### Implementation
 * ```ts
 * a << 8n;
 * ```
 * 
 * ### Explanation
 * Allows to get a bitboard with every bit offset by one square to the north
 * @param bitboard The bitboard to offset
 * @returns The offset bitboard
 */
export const nortOne = (bitboard: Bitboard): Bitboard => bitboard << 8n;

// TODO: Add the other one-step shifts

//#endregion

//#region Bitboard Macros

/**
 * Macro to create a bitboard from a list of coordinates
 * @param coords The coordinates to create the bitboard from
 * @returns The bitboard
 */
export const MK_BITBOARD = (coords: Coords[]): Bitboard => {
	let bitboard = 0n;
	for(const coord of coords) {
		bitboard |= 1n << BigInt(coord[0] * 8 + coord[1]);
	}
	return bitboard;
}

//#endregion