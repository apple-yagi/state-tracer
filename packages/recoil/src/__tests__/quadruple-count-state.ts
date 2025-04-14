import { atom, selector } from "recoil";
import { doubleCountState } from "./double-count-state.ts";

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
