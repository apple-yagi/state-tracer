import { atom } from "jotai";
import { doubleCountState } from "./double-count-state.ts";

export const quadrupleCountState = atom((get) => {
	const count = get(doubleCountState);
	return count * 2;
});
