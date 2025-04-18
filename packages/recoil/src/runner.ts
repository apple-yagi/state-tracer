import { resolve } from "node:path";
import type { CliArgs } from "./cli.ts";
import { extractAtomsAndSelectors } from "./recoil/extract.ts";
import { resolveDeps } from "./recoil/deps.ts";
import { getAllFiles, writeSvgSync } from "@state-tracer/core";

export async function run(args: CliArgs) {
	const { dir, output } = args;
	const files = getAllFiles(resolve(dir));
	const extractResults = files.map(extractAtomsAndSelectors);

	const deps = resolveDeps(extractResults);

	writeSvgSync(deps, output);
	console.log(`✅ SVG saved to ${output}`);
}
