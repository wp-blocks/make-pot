import path from "node:path";
import type { SingleBar } from "cli-progress";
import type { SetOfBlocks } from "gettext-merger";
import { allowedFiles } from "../const.js";
import { parseJsonCallback } from "../extractors/json.js";
import { getFiles } from "../fs/glob.js";
import { readFileAsync } from '../fs/fs.js';
import type { Args, Patterns } from "../types.js";
import { doTree } from "./tree.js";

/**
 * Processes the given files and returns an array of promises that resolve to TranslationStrings.
 *
 * @param patterns
 * @param {Args} args - The arguments for processing the files.
 * @param progressBar - The progress bar element.
 * @return {Promise<SetOfBlocks[]>} - An array of promises that resolve to TranslationStrings.
 */
export async function processFiles(
	patterns: Patterns,
	args: Args,
	progressBar?: SingleBar,
): Promise<Promise<SetOfBlocks>[]> {
	const tasks: Promise<SetOfBlocks>[] = [];
	let filesCount = 0;

	const files = getFiles(args, patterns);

	// loop through the files and parse them
	for await (const file of files) {
		filesCount++;
		const filename = path.basename(file);
		const ext = path.extname(file).replace(/^./, "");
		const fileRealPath = path.resolve(args.paths.cwd, file);

		if (filename === "theme.json" || filename === "block.json") {
			tasks.push(
				readFileAsync(fileRealPath).then((sourceCode) =>
					parseJsonCallback(sourceCode, args.paths.cwd, filename),
				),
			);
		}

		if (allowedFiles.includes(ext)) {
			tasks.push(
				readFileAsync(fileRealPath).then((content) => doTree(content, file)),
			);
		}

		progressBar?.increment(1, { filename });
		progressBar?.setTotal(filesCount);
	}

	return tasks;
}
