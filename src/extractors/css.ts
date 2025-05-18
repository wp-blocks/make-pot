import fs from "node:fs";
import path from "node:path";
import { themeHeaders } from "../const.js";
import type { Args } from "../types.js";
import { getCommentBlock } from "../utils/common.js";
import { getKeyByValue } from "../utils/extractors.js";
import { extractFileData } from "./text.js";

/**
 * Extracts the theme data from the style.css file.
 * @param args - The command line arguments.
 * @param filename - The name of the style.css file.
 */
export function extractCssThemeData(
	args: Args,
	filename = "style.css",
): Record<string, string> {
	let fileData: Record<string, string> = {};
	const styleCssFile = path.join(args.paths.cwd, filename);

	if (fs.existsSync(styleCssFile)) {
		const fileContent = fs.readFileSync(styleCssFile, "utf8");
		const commentBlock = getCommentBlock(fileContent);
		fileData = extractFileData(commentBlock);

		if ("Theme Name" in fileData) {
			console.log(`🔵 Theme stylesheet detected. (${styleCssFile})`);
			args.domain = "theme";

			const themeInfo: Record<string, string> = {};

			// Loop through the theme headers and extract the values with the required format
			for (const keyValueMatch of Object.entries(fileData)) {
				// Check if the line matches the expected format
				if (keyValueMatch?.[0] && keyValueMatch[1]) {
					// filter the retrieved headers
					const header = getKeyByValue(themeHeaders, keyValueMatch[0].trim());
					if (header === undefined) continue;
					themeInfo[header] = keyValueMatch[1].trim();
				}
			}

			return themeInfo;
		}
	} else {
		console.log(`Theme stylesheet not found in ${styleCssFile}`);
	}
	return {};
}
