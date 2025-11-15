import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it, type TestContext } from "node:test";
import { defineIFFCreator } from "@mizdra/inline-fixture-files";
import { randomUUID } from "node:crypto";
import dedent from "dedent";
import { extractAtoms } from "./extract.ts";

const fixtureDir = join(tmpdir(), "@state-tracer/jotai");
const createIFF = defineIFFCreator({
	generateRootDir: () => join(fixtureDir, randomUUID()),
});

describe("extractAtoms", () => {
	it("should extract atoms", async (context: TestContext) => {
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

	it("should extract atoms created with atomWithDefaultSync", async (context: TestContext) => {
		const iff = await createIFF({
			src: {
				"state.ts": dedent`
          import { atom } from "jotai";

          const initAtom = atom(Promise.resolve({}));

          function atomWithDefaultSync(getter) {
            return atom((get) => getter(get));
          }

          export const pinnedConvsAtom = atomWithDefaultSync((get) =>
            get(initAtom).then(() => [])
          );

          export const indexedConvsAtom = atom(async (get) => {
            const pinned = await get(pinnedConvsAtom);
            return pinned;
          });
        `,
			},
		});

		const result = extractAtoms(iff.paths["src/state.ts"]);

		context.assert.equal(result.atoms.length, 3);
		context.assert.deepStrictEqual(
			result.atoms.map((atom) => atom.name),
			["initAtom", "pinnedConvsAtom", "indexedConvsAtom"],
		);
	});

	it("should detect local helpers prefixed with atomWith", async (context: TestContext) => {
		const iff = await createIFF({
			src: {
				"state.ts": dedent`
          import { atom } from "jotai";

          const sourceAtom = atom(0);

          function atomWithMemo(getter) {
            return atom((get) => getter(get));
          }

          export const memoAtom = atomWithMemo((get) => get(sourceAtom));
        `,
			},
		});

		const result = extractAtoms(iff.paths["src/state.ts"]);

		context.assert.equal(result.atoms.length, 2);
		context.assert.deepStrictEqual(
			result.atoms.map((atom) => atom.name),
			["sourceAtom", "memoAtom"],
		);
	});

	it("should detect arrow function helpers prefixed with atomWith", async (context: TestContext) => {
		const iff = await createIFF({
			src: {
				"state.ts": dedent`
          import { atom } from "jotai";

          const fallbackAtom = atom(0);

          const atomWithInline = (getter) => atom((get) => getter(get));

          export const cachedAtom = atomWithInline((get) => get(fallbackAtom));
        `,
			},
		});

		const result = extractAtoms(iff.paths["src/state.ts"]);

		context.assert.equal(result.atoms.length, 2);
		context.assert.deepStrictEqual(
			result.atoms.map((atom) => atom.name),
			["fallbackAtom", "cachedAtom"],
		);
	});
});
