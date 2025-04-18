import { describe, it } from "node:test";
import { generateDot } from "./index.ts";

describe("generateDot", () => {
	it("should generate a dot representation of the dependency graph", (context) => {
		const edges = [
			{
				from: "atom1",
				to: "selector1",
			},
			{
				from: "atom2",
				to: "selector2",
			},
			{
				from: "selector1",
				to: "atom3",
			},
			{
				from: "botchi",
			},
		];

		context.assert.snapshot(generateDot(edges), {
			serializers: [(value) => value.replace(/\\n/g, "\n")],
		});
	});
});
