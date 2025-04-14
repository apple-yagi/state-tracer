import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { defineIFFCreator } from "@mizdra/inline-fixture-files";
import { randomUUID } from "node:crypto";
import dedent from "dedent";
import { extractAtomsAndSelectors } from "./extract.ts";

const fixtureDir = join(tmpdir(), "@state-tracer/recoil");
const createIFF = defineIFFCreator({
	generateRootDir: () => join(fixtureDir, randomUUID()),
});

describe("extract", () => {
	it("should extract atoms and selectors", async (context) => {
		const iff = await createIFF({
			src: {
				"state.js": dedent`
            import { atom, selector, atomFamily, selectorFamily } from "recoil";

            export const countState = atom({
              key: 'countState',
              default: 0,
            });

            export const doubleCountState = selector({
              key: 'doubleCountState',
              get: ({ get }) => {
                const count = get(countState);
                return count * 2;
              },
            });

						export const quadrupleCountState = atom({
							key: 'doubleCountAtomState',
							default: selector({
								key: 'quadrupleCountState',
								get: ({ get }) => {
									const count = get(doubleCountState);
									return count * 2;
								},
							}),
						});

						export const countStateFamily = atomFamily({
							key: 'countStateFamily',
							default: (param) => param,
						});

						export const doubleCountStateFamily = selectorFamily({
							key: 'doubleCountStateFamily',
							get: (param) => ({ get }) => {
								const count = get(countStateFamily(param));
								return count * 2;
							},
						});

						export const quadrupleCountStateFamily = atomFamily({
							key: 'quadrupleCountStateFamily',
							default: selectorFamily({
								key: 'quadrupleCountStateFamily',
								get: (param) => ({ get }) => {
									const count = get(doubleCountStateFamily(param));
									return count * 2;
								},
							}),
						});
          `,
			},
		});

		const result = extractAtomsAndSelectors(iff.paths["src/state.js"]);

		context.assert.equal(result.atoms.length, 2);
		context.assert.equal(result.selectors.length, 1);
		context.assert.equal(result.atomFamilies.length, 2);
		context.assert.equal(result.selectorFamilies.length, 1);
		context.assert.equal(result.atoms[0]?.name, "countState");
		context.assert.equal(result.atoms[1]?.name, "quadrupleCountState");
		context.assert.equal(result.selectors[0]?.name, "doubleCountState");
		context.assert.equal(result.atomFamilies[0]?.name, "countStateFamily");
		context.assert.equal(
			result.atomFamilies[1]?.name,
			"quadrupleCountStateFamily",
		);
		context.assert.equal(
			result.selectorFamilies[0]?.name,
			"doubleCountStateFamily",
		);
	});
});
