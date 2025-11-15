import { readFileSync } from "node:fs";
import { parseAndWalk, walk, type Node } from "oxc-walker";
import type {
	Argument,
	ArrowFunctionExpression,
	Function as FunctionNode,
	FunctionBody,
	VariableDeclarator,
} from "oxc-parser";

export type ExtractResult = {
	name: string;
	arguments: Argument[];
	filePath: string;
};

type FunctionLike = FunctionNode | ArrowFunctionExpression;

type ExtractedFile = {
	filePath: string;
	atoms: ExtractResult[];
};

export function extractAtoms(filePath: string): ExtractedFile {
	const code = readFileSync(filePath, "utf-8");
	const localNames = {
		atom: "",
		atomFamily: "",
		atomWithRefresh: "",
		atomWithDefault: "",
		atomWithLazy: "",
		atomWithReducer: "",
		atomWithStorage: "",
		atomWithObservable: "",
		atomWithReset: "",
	};
	const jotaiUtilsFactories = Object.keys(localNames).filter(
		(key) => key !== "atom",
	);
	const localNameValues = () =>
		Object.values(localNames).filter((name): name is string => !!name);
	const resolvedFactoryNames = new Set<string>();
	const parentMap = new WeakMap<Node, Node>();
	const registerFactory = (name?: string) => {
		if (name) resolvedFactoryNames.add(name);
	};
	const hasAtomWithPrefix = (name: string) => name.startsWith("atomWith");
	const isAtomFactory = (name: string | undefined) => {
		if (!name) return false;
		if (resolvedFactoryNames.has(name)) return true;
		if (hasAtomWithPrefix(name)) return true;
		return localNameValues().includes(name);
	};
	const maybeRegisterCustomFactory = (
		name: string | undefined,
		node: FunctionLike,
	) => {
		if (!name) return;
		if (!name.startsWith("atomWith")) return;
		if (functionReturnsAtomFactory(node, isAtomFactory)) {
			registerFactory(name);
		}
	};

	const atoms: ExtractResult[] = [];
	const potentialAtoms: Array<{
		callee: string;
		name: string;
		arguments: Argument[];
	}> = [];

	const isTopLevelVariableDeclarator = (variable: VariableDeclarator) => {
		const declarationParent = parentMap.get(variable);
		if (!declarationParent || declarationParent.type !== "VariableDeclaration") {
			return false;
		}
		const container = parentMap.get(declarationParent);
		if (!container) return false;
		if (container.type === "Program") return true;
		if (
			container.type === "ExportNamedDeclaration" ||
			container.type === "ExportDefaultDeclaration"
		) {
			const programParent = parentMap.get(container);
			return programParent?.type === "Program";
		}
		return false;
	};

	parseAndWalk(code, filePath, (node, parent) => {
		if (parent) parentMap.set(node as Node, parent as Node);

		if (
			node.type === "ImportSpecifier" &&
			parent?.type === "ImportDeclaration"
		) {
			const imported = node.imported;
			const local = node.local.name;
			const source = parent.source.value;

			if (imported.type === "Identifier") {
				if (source === "jotai" && imported.name === "atom") {
					localNames.atom = local;
					registerFactory(local);
				} else if (source === "jotai/utils") {
					if (jotaiUtilsFactories.includes(imported.name)) {
						localNames[imported.name as keyof typeof localNames] = local;
						registerFactory(local);
					}
				}
			}
		}

		if (node.type === "FunctionDeclaration") {
			maybeRegisterCustomFactory(node.id?.name, node);
		}

		if (node.type === "VariableDeclarator" && node.id.type === "Identifier") {
			const calleeName = node.id.name;
			if (
				node.init?.type === "FunctionExpression" ||
				node.init?.type === "ArrowFunctionExpression"
			) {
				maybeRegisterCustomFactory(calleeName, node.init);
			}
		}

		if (node.type === "CallExpression") {
			if (node.callee.type === "Identifier") {
				if (
					parent?.type === "VariableDeclarator" &&
					parent.id.type === "Identifier" &&
					isTopLevelVariableDeclarator(parent)
				) {
					potentialAtoms.push({
						callee: node.callee.name,
						name: parent.id.name,
						arguments: node.arguments,
					});
				}
			}
		}
	});

	for (const candidate of potentialAtoms) {
		if (isAtomFactory(candidate.callee)) {
			atoms.push({
				name: candidate.name,
				arguments: candidate.arguments,
				filePath,
			});
		}
	}

	return {
		filePath,
		atoms,
	};
}

function functionReturnsAtomFactory(
	fn: FunctionLike,
	isAtomFactory: (name: string | undefined) => boolean,
) {
	const isFactoryCallExpression = (expr: unknown): boolean => {
		if (expr && typeof expr === "object") {
			const callExpr = expr as { type?: string; callee?: unknown };
			if (
				callExpr.type === "CallExpression" &&
				callExpr.callee &&
				typeof callExpr.callee === "object" &&
				(callExpr.callee as { type?: string }).type === "Identifier"
			) {
				const identifier = callExpr.callee as { name?: string };
				return isAtomFactory(identifier.name);
			}
		}
		return false;
	};

	const blockContainsFactoryCall = (body: FunctionBody): boolean => {
		let returnsFactory = false;
		walk(body, {
			enter(node) {
				if (node.type === "ReturnStatement" && node.argument) {
					if (isFactoryCallExpression(node.argument)) {
						returnsFactory = true;
					}
				}
			},
		});

		return returnsFactory;
	};

	if (fn.type === "ArrowFunctionExpression") {
		if (fn.expression) {
			return isFactoryCallExpression(fn.body);
		}

		if (fn.body.type === "BlockStatement") {
			return blockContainsFactoryCall(fn.body);
		}

		return false;
	}

	if (!fn.body) return false;
	return blockContainsFactoryCall(fn.body);
}
