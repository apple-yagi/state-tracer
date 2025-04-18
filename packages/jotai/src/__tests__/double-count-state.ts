import { atom } from "jotai";
import { countState } from "./count-state.ts";

export const doubleCountState = atom((get) => {
	const count = get(countState);
	return count * 2;
});
