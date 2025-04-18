import { parseArgs, type ParseArgsOptionsConfig } from "node:util";

export type CliArgs = {
	dir: string;
	output: string;
};

const options: ParseArgsOptionsConfig = {
	output: {
		type: "string",
		short: "o",
		multiple: false,
		default: "jotai-graph.svg",
	},
};

export function parseCliArgs(args: string[]): CliArgs {
	const { values, positionals } = parseArgs({
		args,
		allowPositionals: true,
		options,
	});

	return {
		dir: positionals[0] ?? ".",
		output: values.output,
	} as CliArgs;
}
