#!/usr/bin/env node

import { run, parseCliArgs } from "../dist/index.js";

run(parseCliArgs(process.argv.slice(2))).catch((e) => {
	// eslint-disable-next-line no-console
	console.error(e);
	process.exit(1);
});
