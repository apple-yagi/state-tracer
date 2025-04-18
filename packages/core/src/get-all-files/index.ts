import { readdirSync } from "node:fs";
import { extname, join, resolve } from "node:path";

export function getAllFiles(dir: string): string[] {
	const entries = readdirSync(dir, { withFileTypes: true });
	return entries.flatMap((entry) => {
		const fullPath = join(dir, entry.name);
		if (entry.isDirectory()) {
			return getAllFiles(fullPath);
		}
		if (/\.(ts|tsx|js|jsx)$/.test(extname(entry.name))) {
			return [resolve(fullPath)];
		}
		return [];
	});
}
