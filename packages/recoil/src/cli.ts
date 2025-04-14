import { parseArgs, type ParseArgsOptionsConfig } from "node:util";
import { extractAtomsAndSelectorsWithDeps } from "./extract/index.ts";
import { generateDot } from "./dot/index.ts";
import { Graphviz } from "@hpcc-js/wasm";

const options: ParseArgsOptionsConfig = {
	filename: {
		type: "string",
		short: "f",
		multiple: false,
	},
	output: {
		type: "string",
		short: "o",
		multiple: false,
		default: "recoil-graph.svg",
	},
};

const args = process.argv.slice(2);

const { values } = parseArgs({ options, args });

if (typeof values.filename !== "string") {
	console.error("Please provide a filename using the -f option.");
	process.exit(1);
}

if (typeof values.output !== "string") {
	console.error("Please provide an output filename using the -o option.");
	process.exit(1);
}

const filename = values.filename;
const output = values.output;

const result = extractAtomsAndSelectorsWithDeps(filename);
const dot = generateDot([
	...result.atomDeps,
	...result.selectorDeps,
	...result.atomFamilyDeps,
	...result.selectorFamilyDeps,
]);

async function renderDotToSVG() {
	// 初期化して描画
	const graphviz = await Graphviz.load();
	const svg = await graphviz.layout(dot, "svg");

	// SVGをファイルに保存する場合
	const fs = await import("node:fs/promises");
	await fs.writeFile(output, svg, "utf-8");

	console.log(`✅ SVG saved to ${output}`);
}

renderDotToSVG();
