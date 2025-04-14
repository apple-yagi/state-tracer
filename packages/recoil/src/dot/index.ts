export type Edge = {
	from: string;
	to?: string;
};

export function generateDot(edges: Edge[]): string {
	return `
digraph {
  rankdir=LR;
  node [shape=box, style=rounded, fontname="Arial"];
  ${edges
		.map((edge) =>
			edge.to ? `  "${edge.from}" -> "${edge.to}";` : `  "${edge.from}";`,
		)
		.join("\n")}
}
  `.trim();
}
