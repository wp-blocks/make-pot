import { extractMainFileData } from "../extractors/headers.js";
import { extractPackageJson } from "../extractors/packageJson.js";
import { writeFile } from "../fs/fs.js";
import type { Args } from "../types.js";
import { exec } from "./exec.js";

/**
 * Generates a pot file for localization.
 *
 * @param args - the command line arguments
 * @return {string} - a promise that resolves when the pot file is generated
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
	return await exec(args)
		.then((jsonTranslations) => {
			writeFile(jsonTranslations, args);

			return jsonTranslations;
		})
		.catch((error) => {
			console.error(error);

			return "";
		});
}
