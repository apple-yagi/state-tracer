import { atom, selector } from "recoil";

export const countState = atom({
	key: "countState",
	default: 0,
});

export const doubleCountState = selector({
	key: "doubleCountState",
	get: ({ get }) => {
		const count = get(countState);
		return count * 2;
	},
});

export const quadrupleCountState = atom({
	key: "doubleCountAtomState",
	default: selector({
		key: "quadrupleCountState",
		get: ({ get }) => {
			const count = get(doubleCountState);
			return count * 2;
		},
	}),
});
