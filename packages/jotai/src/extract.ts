import { readFileSync } from "node:fs";
import { parseAndWalk } from "oxc-walker";
import type { Argument } from "oxc-parser";

export type ExtractResult = {
	name: string;
	arguments: Argument[];
	filePath: string;
};

export function extractAtoms(filePath: string) {
	const code = readFileSync(filePath, "utf-8");

	const localNames = {
		atom: "",
	};

	const atoms: ExtractResult[] = [];

	parseAndWalk(code, filePath, (node, parent) => {
		if (
			node.type === "ImportSpecifier" &&
			parent?.type === "ImportDeclaration"
		) {
			const imported = node.imported;
			const local = node.local.name;
			const source = parent.source.value;

			if (source === "jotai") {
				if (imported.type === "Identifier") {
					if (imported.name === "atom") localNames.atom = local;
				}
			}
		}

		if (node.type === "CallExpression") {
			if (node.callee.type === "Identifier") {
				if (
					Object.values(localNames).includes(node.callee.name) &&
					parent?.type === "VariableDeclarator"
				) {
					if (
						node.callee.name === localNames.atom &&
						parent.id.type === "Identifier"
					) {
						atoms.push({
							name: parent.id.name,
							arguments: node.arguments,
							filePath,
						});
					}
				}
			}
		}
	});

	return {
		filePath,
		atoms,
	};
}
