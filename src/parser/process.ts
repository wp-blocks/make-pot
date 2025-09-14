import path from "node:path";
import type { SingleBar } from "cli-progress";
import type { SetOfBlocks } from "gettext-merger";
import { allowedFormats } from "../const.js";
import { parseJsonCallback } from "../extractors/json.js";
import { readFileAsync } from "../fs/fs.js";
import { getFiles } from "../fs/glob.js";
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
	let processedFilesCount = 0;

	const files = getFiles(args, patterns);

	if (progressBar) {
		progressBar.setTotal(Object.values(files).length);
		progressBar.update(0, {
			filename: `Found ${Object.values(files).length} files`,
		});
	}

	// loop through the files and parse them
	for await (const file of files) {
		processedFilesCount++;
		const filename = path.basename(file);
		const ext = path.extname(file).replace(/^./, "");
		const fileRealPath = path.resolve(args.paths.cwd, file);

		if (filename === "theme.json" || filename === "block.json") {
			tasks.push(
				readFileAsync(fileRealPath).then((sourceCode) =>
					parseJsonCallback(sourceCode, args.paths.cwd, filename),
				),
			);
		} else if (allowedFormats.includes(ext)) {
			const fileTree = readFileAsync(fileRealPath).then((content) =>
				doTree(content, file, args.debug, args),
			);
			if (fileTree) {
				tasks.push(fileTree as Promise<SetOfBlocks>);
			}
		}

		if (progressBar) {
			progressBar.update(processedFilesCount, { filename: filename });
			progressBar.render();
		}
	}

	return tasks;
}
