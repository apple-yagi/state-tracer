import { walk } from "oxc-walker";
import type { extractAtomsAndSelectors, ExtractResult } from "./extract.ts";
import type { Edge } from "@state-tracer/core";

export function resolveDeps(
	extractResults: ReturnType<typeof extractAtomsAndSelectors>[],
) {
	const allDefs = new Map<string, ExtractResult>();

	for (const file of extractResults) {
		for (const atom of file.atoms) allDefs.set(atom.name, atom);
		for (const selector of file.selectors) allDefs.set(selector.name, selector);
		for (const atomFamily of file.atomFamilies)
			allDefs.set(atomFamily.name, atomFamily);
		for (const selectorFamily of file.selectorFamilies)
			allDefs.set(selectorFamily.name, selectorFamily);
	}

	const deps: Edge[] = [];

	for (const file of extractResults) {
		const knownNames = file.atoms
			.concat(file.selectors)
			.concat(file.atomFamilies)
			.concat(file.selectorFamilies)
			.map((d) => d.name);

		const resolveName = (name: string): string | undefined => {
			if (knownNames.includes(name)) return name;
			for (const [, def] of allDefs.entries()) {
				if (def.name === name) return def.name;
			}
			return undefined;
		};

		const defs = file.atoms
			.concat(file.selectors)
			.concat(file.atomFamilies)
			.concat(file.selectorFamilies);
		for (const def of defs) {
			for (const arg of def.arguments) {
				walk(arg, {
					enter: (node) => {
						if (node.type === "Identifier") {
							const resolvedName = resolveName(node.name);
							if (resolvedName) {
								if (
									!deps.some(
										(dep) => dep.from === def.name && dep.to === resolvedName,
									)
								) {
									deps.push({ from: def.name, to: resolvedName });
								}
							}
						}
					},
				});
			}
		}
	}

	// どのstateにも依存していないstateを追加する
	for (const def of allDefs.values()) {
		if (!deps.some((dep) => dep.from === def.name)) {
			deps.push({ from: def.name });
		}
	}

	return deps;
}
