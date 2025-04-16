import { selector } from "recoil";
import { countState } from "./count-state.ts";
import { uuid } from "./uuid.ts";

export const doubleCountState = selector({
	key: uuid(),
	get: ({ get }) => {
		const count = get(countState);
		return count * 2;
	},
});
