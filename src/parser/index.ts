import path from "node:path";
import { extractMainFileData } from "../extractors/headers.js";
import { extractPackageJson } from "../extractors/json.js";
import { writeFile } from "../fs/index.js";
import type { Args } from "../types.js";
import { exec } from "./exec.js";

function getOutputPath(args: Args): string {
	return path.join(
		process.cwd(),
		args.headers?.domainPath ?? args.paths.out ?? "languages",
		`${args?.slug}.${args.options?.json ? "json" : "pot"}`,
	);
}

/**
 * Generates a pot file for localization.
 *
 * @param args - the command line arguments
 * @return {Promise<void>} - a promise that resolves when the pot file is generated
 */
export async function makePot(args: Args): Promise<string> {
	/** Collect metadata from the get package json */
	const pkgData = extractPackageJson(args);

	/** Get metadata from the main file (theme and plugin) */
	const metadata = extractMainFileData(args);

	/** Merge the metadata to get a single object with all the headers */
	args.headers = {
		...args.headers,
		...pkgData,
		...metadata,
	} as Args["headers"];

	/** Generate the pot file */
	const jsonTranslations = await exec(args);

	const outputPath = getOutputPath(args);

	console.log(`Writing pot file to ${outputPath}`);

	writeFile(jsonTranslations, outputPath);

	return jsonTranslations;
}
