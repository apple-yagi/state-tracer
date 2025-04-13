import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseAndWalk } from "oxc-walker";

export function extractAtomsAndSelectors(filename: string) {
	const code = readFileSync(resolve(filename), "utf-8");

	let localAtomName = "";
	let localSelectorName = "";

	const atoms = new Set();
	const selectors = new Set();
	// for debug
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const nodeList: any[] = [];

	parseAndWalk(code, filename, (node, parent) => {
		nodeList.push(node);

		if (
			node.type === "ImportSpecifier" &&
			parent?.type === "ImportDeclaration" &&
			parent.source.value === "recoil"
		) {
			if (node.imported.type === "Identifier") {
				if (node.imported.name === "atom") {
					localAtomName = node.local.name;
				} else if (node.imported.name === "selector") {
					localSelectorName = node.local.name;
				}
			}
		}

		if (node.type === "CallExpression") {
			if (node.callee.type === "Identifier") {
				if (
					node.callee.name === localAtomName ||
					node.callee.name === localSelectorName
				) {
					if (node.callee.name === localAtomName) {
						// ref https://github.com/oxc-project/oxc-walker/pull/91
						// @ts-ignore
						atoms.add(parent?.id.name);
					} else if (node.callee.name === localSelectorName) {
						// ref https://github.com/oxc-project/oxc-walker/pull/91
						// @ts-ignore
						selectors.add(parent?.id.name);
					}
				}
			}
		}
	});

	return { atoms, selectors, nodeList };
}
