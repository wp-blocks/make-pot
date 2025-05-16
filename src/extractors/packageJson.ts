import fs from "node:fs";
import path from "node:path";
import { pkgJsonHeaders } from "../const";
import type { Args } from "../types";

/**
 * Extracts package data from the given arguments and returns a record
 * containing the specified fields from the package.json file.
 *
 * @param {Args} args - The arguments for extracting package data.
 *
 * @return {Record<string, string>} - A record containing the extracted package data.
 */
export function extractPackageJson(args: Args): Record<string, string> {
	const fields = pkgJsonHeaders;
	const pkgJsonMeta: Record<string, string> = {};
	// read the package.json file
	const packageJsonPath = args.paths.cwd
		? path.join(args.paths.cwd, "package.json")
		: "package.json";

	/**
	 *  check if the package.json extract the fields from the package.json file
	 */
	if (fs.existsSync(packageJsonPath)) {
		const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
		for (const field of Object.keys(fields)) {
			// if the field exists in the package.json
			if (field in packageJson) {
				pkgJsonMeta[field] = packageJson[field] as string;
			}
		}
	}
	return pkgJsonMeta;
}
