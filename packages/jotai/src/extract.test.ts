import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { defineIFFCreator } from "@mizdra/inline-fixture-files";
import { randomUUID } from "node:crypto";
import dedent from "dedent";
import { extractAtoms } from "./extract.ts";

const fixtureDir = join(tmpdir(), "@state-tracer/jotai");
const createIFF = defineIFFCreator({
	generateRootDir: () => join(fixtureDir, randomUUID()),
});

describe("extractAtoms", () => {
	it("should extract atoms", async (context) => {
		const iff = await createIFF({
			src: {
				"state.js": dedent`
            import { atom } from "jotai";

            export const countState = atom(0);

            export const doubleCountState = atom((get) => {
              const count = get(countState);
              return count * 2;
            });
          `,
			},
		});

		const result = extractAtoms(iff.paths["src/state.js"]);

		context.assert.equal(result.atoms.length, 2);
		context.assert.equal(result.atoms[0]?.name, "countState");
		context.assert.equal(result.atoms[1]?.name, "doubleCountState");
	});
});
