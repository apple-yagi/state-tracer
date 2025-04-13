import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { defineIFFCreator } from "@mizdra/inline-fixture-files";
import { randomUUID } from "node:crypto";
import dedent from "dedent";
import { extractAtomsAndSelectors } from "./index.ts";

const fixtureDir = join(tmpdir(), "@state-tracer/recoil");
const createIFF = defineIFFCreator({
	generateRootDir: () => join(fixtureDir, randomUUID()),
});

describe("extract", () => {
	it("should extract atoms and selectors", async (context) => {
		const iff = await createIFF({
			src: {
				"state.js": dedent`
            import { atom, selector } from "recoil";

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
          `,
			},
		});

		const result = extractAtomsAndSelectors(iff.paths["src/state.js"]);

		context.assert.snapshot(
			{
				atoms: Array.from(result.atoms),
				selectors: Array.from(result.selectors),
				nodeList: result.nodeList,
			},
			{
				serializers: [(value) => JSON.stringify(value, null, 2)],
			},
		);
	});
});
