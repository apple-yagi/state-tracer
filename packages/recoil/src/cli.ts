import { parseArgs, type ParseArgsOptionsConfig } from "node:util";

type CliArgs = {
	dir: string;
	output: string;
};

const options: ParseArgsOptionsConfig = {
	dir: {
		type: "string",
		short: "d",
		multiple: false,
	},
	output: {
		type: "string",
		short: "o",
		multiple: false,
		default: "recoil-graph.svg",
	},
};

export function parseCliArgs(args: string[]): CliArgs {
	const { values } = parseArgs({ args, options });

	return {
		dir: values.dir,
		output: values.output,
	} as CliArgs;
}
