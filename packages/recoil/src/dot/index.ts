import type { Deps } from "../extract/index.ts";

export function generateDot(depsList: Deps[]): string {
	const edges: string[] = [];
	const allNodes = new Set<string>();

	for (const { name, deps } of depsList) {
		allNodes.add(name);
		for (const dep of deps) {
			allNodes.add(dep);
			edges.push(`${dep} -> ${name};`);
		}
	}

	const nodeLines = Array.from(allNodes).map((name) => `  "${name}";`);

	return `
digraph {
  rankdir=LR;
  node [shape=box, style=rounded, fontname="Arial"];
  ${nodeLines.join("\n  ")}
  ${edges.map((e) => `  ${e}`).join("\n")}
}
	`.trim();
}
