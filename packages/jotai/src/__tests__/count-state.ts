import { atom } from "jotai";
import { atomWithReset } from "jotai/utils";

export const botchi = atom(0);

export const countState = atomWithReset(0);
