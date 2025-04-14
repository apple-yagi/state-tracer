import { describe, it } from "node:test";
import { generateDot } from "./index.ts";

describe("generateDot", () => {
	it("should generate a dot representation of the dependency graph", (context) => {
		const depsList = [
			{ name: "countState", deps: [] },
			{ name: "doubleCountState", deps: ["countState"] },
			{ name: "quadrupleCountState", deps: ["doubleCountState"] },
			{ name: "countStateFamily", deps: [] },
			{ name: "doubleCountStateFamily", deps: ["countStateFamily"] },
			{ name: "quadrupleCountStateFamily", deps: ["doubleCountStateFamily"] },
		];

		context.assert.snapshot(generateDot(depsList), {
			serializers: [(value) => value.replace(/\\n/g, "\n")],
		});
	});
});
