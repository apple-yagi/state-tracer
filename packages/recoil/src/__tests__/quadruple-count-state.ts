import { atom, selector } from "recoil";
import { doubleCountState } from "./double-count-state.ts";
import { uuid } from "./uuid.ts";

export const quadrupleCountState = atom({
	key: uuid(),
	default: selector({
		key: uuid(),
		get: ({ get }) => {
			const count = get(doubleCountState);
			return count * 2;
		},
	}),
});
