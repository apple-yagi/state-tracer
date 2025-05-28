import { resolve } from "node:path";
import type { CliArgs } from "./cli.ts";
import { extractAtomsAndSelectors } from "./extract.ts";
import { resolveDeps } from "./deps.ts";
import { getAllFiles, writeSvgSync } from "@state-tracer/core";

export async function run(args: CliArgs) {
	const { dir, output } = args;
	const files = getAllFiles(resolve(dir));
	const extractResults = files.map(extractAtomsAndSelectors);

	const deps = resolveDeps(extractResults);

	writeSvgSync(deps, output);
	console.log(`✅ SVG saved to ${output}`);

	const atomCount = extractResults
		.map((result) => result.atoms.length)
		.reduce((a, b) => a + b, 0);
	const selectorCount = extractResults
		.map((result) => result.selectors.length)
		.reduce((a, b) => a + b, 0);
	const atomFamilyCount = extractResults
		.map((result) => result.atomFamilies.length)
		.reduce((a, b) => a + b, 0);
	const selectorFamilyCount = extractResults
		.map((result) => result.selectorFamilies.length)
		.reduce((a, b) => a + b, 0);
	console.log(
		`-----------------------
atom count: ${atomCount}
selector count: ${selectorCount}
atomFamily count: ${atomFamilyCount}
selectorFamily count: ${selectorFamilyCount}`,
	);
}
