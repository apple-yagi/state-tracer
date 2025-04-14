import { resolve } from "node:path";
import { getAllFiles } from "./get-all-files/index.ts";
import type { CliArgs } from "./cli.ts";
import { extractAtomsAndSelectors } from "./recoil/extract.ts";
import { resolveDeps } from "./recoil/deps.ts";
import { generateDot } from "./dot/index.ts";
import { Graphviz } from "@hpcc-js/wasm";
import { writeFileSync } from "node:fs";

export async function run(args: CliArgs) {
	const { dir, output } = args;
	const files = getAllFiles(resolve(dir));
	const extractResults = files.map(extractAtomsAndSelectors);

	const deps = resolveDeps(extractResults);
	const dot = generateDot(deps);

	const graphviz = await Graphviz.load();
	const svg = await graphviz.layout(dot, "svg");
	writeFileSync(output, svg, "utf-8");
	console.log(`✅ SVG saved to ${output}`);
}
