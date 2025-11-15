import { resolve } from "node:path";
import type { CliArgs } from "./cli.ts";
import { extractAtoms } from "./extract.ts";
import { resolveDeps } from "./deps.ts";
import { getAllFiles, writeSvgSync } from "@state-tracer/core";

export async function run(args: CliArgs) {
	const { dir, output } = args;
	const files = getAllFiles(resolve(dir));
	const extractResults = files.map(extractAtoms);

	const deps = resolveDeps(extractResults);

	writeSvgSync(deps, output);
	console.log(`✅ SVG saved to ${output}`);

	const atomCount = extractResults
		.map((result) => result.atoms.length)
		.reduce((total: number, count: number) => total + count, 0);
	console.log(
		`-------------
atom count: ${atomCount}`,
	);
}
