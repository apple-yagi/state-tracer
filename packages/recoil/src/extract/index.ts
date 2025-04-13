import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseAndWalk, walk } from "oxc-walker";
import type { Argument } from "oxc-parser";

type ExtractResult = {
	name: string;
	arguments: Argument[];
};

type Deps = {
	name: string;
	deps: string[];
};

export function extractAtomsAndSelectorsWithDeps(filename: string) {
	const code = readFileSync(resolve(filename), "utf-8");

	let localAtomName = "";
	let localSelectorName = "";

	const atoms = new Set<ExtractResult>();
	const selectors = new Set<ExtractResult>();
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
					(node.callee.name === localAtomName ||
						node.callee.name === localSelectorName) &&
					// ref https://github.com/oxc-project/oxc-walker/pull/91
					// @ts-ignore
					parent?.type === "VariableDeclarator"
				) {
					if (node.callee.name === localAtomName) {
						// ref https://github.com/oxc-project/oxc-walker/pull/91
						// @ts-ignore
						atoms.add({ name: parent?.id.name, arguments: node.arguments });
					} else if (node.callee.name === localSelectorName) {
						// ref https://github.com/oxc-project/oxc-walker/pull/91
						// @ts-ignore
						selectors.add({ name: parent?.id.name, arguments: node.arguments });
					}
				}
			}
		}
	});

	const atomNameList = Array.from(atoms).map((atom) => atom.name);
	const selectorNameList = Array.from(selectors).map(
		(selector) => selector.name,
	);
	const allNames = [...atomNameList, ...selectorNameList];

	const atomDeps = Array.from(atoms).map((atom) => {
		const deps: Deps = { name: atom.name, deps: [] };
		for (const arg of atom.arguments) {
			walk(arg, {
				enter(node) {
					if (node.type === "Identifier" && allNames.includes(node.name)) {
						deps.deps.push(node.name);
					}
				},
			});
		}

		return deps;
	});

	const selectorDeps = Array.from(selectors).map((selector) => {
		const deps: Deps = { name: selector.name, deps: [] };
		for (const arg of selector.arguments) {
			walk(arg, {
				enter(node) {
					if (node.type === "Identifier" && allNames.includes(node.name)) {
						deps.deps.push(node.name);
					}
				},
			});
		}

		return deps;
	});

	return {
		atoms: Array.from(atoms),
		selectors: Array.from(selectors),
		atomDeps,
		selectorDeps,
	};
}
