
export const uniquePairs = <T>(arr: T[]): [T, T][] => {
	const pairs: [T, T][] = [];
	for(let i = 0; i < arr.length; i++) {
		for(let j = i + 1; j < arr.length; j++) {
			pairs.push([arr[i], arr[j]]);
		}
	}
	return pairs;
}