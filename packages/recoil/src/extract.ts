import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { parseAndWalk } from "oxc-walker";
import type { Argument } from "oxc-parser";

export type ExtractResult = {
	name: string;
	arguments: Argument[];
	filePath: string;
};

export function extractAtomsAndSelectors(filePath: string) {
	const code = readFileSync(filePath, "utf-8");

	const localNames = {
		atom: "",
		selector: "",
		atomFamily: "",
		selectorFamily: "",
	};

	const atoms: ExtractResult[] = [];
	const selectors: ExtractResult[] = [];
	const atomFamilies: ExtractResult[] = [];
	const selectorFamilies: ExtractResult[] = [];

	parseAndWalk(code, filePath, (node, parent) => {
		if (
			node.type === "ImportSpecifier" &&
			parent?.type === "ImportDeclaration"
		) {
			const imported = node.imported;
			const local = node.local.name;
			const source = parent.source.value;

			if (source === "recoil") {
				if (imported.type === "Identifier") {
					if (imported.name === "atom") localNames.atom = local;
					if (imported.name === "selector") localNames.selector = local;
					if (imported.name === "atomFamily") localNames.atomFamily = local;
					if (imported.name === "selectorFamily")
						localNames.selectorFamily = local;
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
					} else if (
						node.callee.name === localNames.selector &&
						parent.id.type === "Identifier"
					) {
						selectors.push({
							name: parent.id.name,
							arguments: node.arguments,
							filePath,
						});
					} else if (
						node.callee.name === localNames.atomFamily &&
						parent.id.type === "Identifier"
					) {
						atomFamilies.push({
							name: parent.id.name,
							arguments: node.arguments,
							filePath,
						});
					} else if (
						node.callee.name === localNames.selectorFamily &&
						parent.id.type === "Identifier"
					) {
						selectorFamilies.push({
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
		selectors,
		atomFamilies,
		selectorFamilies,
	};
}
