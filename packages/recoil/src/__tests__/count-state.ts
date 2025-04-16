import { atom } from "recoil";
import { uuid } from "./uuid.ts";

export const botchi = atom({
	key: uuid(),
	default: 0,
});

export const countState = atom({
	key: uuid(),
	default: 0,
});
