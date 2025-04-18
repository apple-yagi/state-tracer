import { Graphviz } from "@hpcc-js/wasm";
import { generateDot, type Edge } from "../dot/index.ts";
import { writeFileSync, type PathLike } from "node:fs";

export async function writeSvgSync(edges: Edge[], file: PathLike) {
	const dot = generateDot(edges);

	const graphviz = await Graphviz.load();
	const svg = await graphviz.layout(dot, "svg");
	writeFileSync(file, svg, "utf-8");
}
