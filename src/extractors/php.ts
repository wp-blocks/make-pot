import fs from "node:fs";
import path from "node:path";
import { pluginHeaders } from "../const.js";
import type { Args } from "../types.js";
import { getKeyByValue } from "../utils/extractors.js";

export function extractPhpPluginData(args: Args): Record<string, string> {
	let fileData: Record<string, string> = {};
	const folderPhpFile = path.join(args.paths.cwd, `${args.slug}.php`);

	if (fs.existsSync(folderPhpFile)) {
		const fileContent = fs.readFileSync(folderPhpFile, "utf8");
		fileData = parsePHPFile(fileContent);

		console.log(`🔵 Plugin file detected. (${folderPhpFile})`);

		// Set the domain
		args.domain = "plugin";

		return fileData;
	}

	console.log("Plugin file not found.");
	console.log(`Missing Plugin filename: ${folderPhpFile}`);

	return {};
}

/**
 * Parses a PHP file and extracts the plugin information from the comment block.
 *
 * @param {string} phpContent - The content of the PHP file.
 * @return {Record<string, string>} - A record containing the plugin information.
 */
export function parsePHPFile(phpContent: string): Record<string, string> {
	const match = phpContent.match(/\/\*\*([\s\S]*?)\*\//);

	if (match?.[1] && match) {
		const commentBlock = match[1];
		const lines = commentBlock.split("\n");

		const pluginInfo: Record<string, string> = {};

		for (const line of lines) {
			const keyValueMatch = line.match(/^\s*\*\s*([^:]+):\s*(.*)/);

			if (!keyValueMatch) {
				continue;
			}

			// Check if the line matches the expected format
			if (keyValueMatch?.[1] && keyValueMatch[2]) {
				// filter the retrieved headers
				const header = getKeyByValue(pluginHeaders, keyValueMatch[1].trim());
				if (header === undefined) continue;
				pluginInfo[header] = keyValueMatch[2].trim();
			}
		}

		return pluginInfo;
	}
	return {};
}
