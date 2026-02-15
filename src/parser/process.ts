import path from 'node:path'
import type { SingleBar } from 'cli-progress'
import type { SetOfBlocks } from 'gettext-merger'
import { parseJsonCallback } from '../extractors/json.js'
import { readFileAsync } from '../fs/fs.js'
import { getFiles } from '../fs/glob.js'
import type { Args, Patterns } from '../types.js'
import { doTree } from './tree.js'
import { allowedFormats } from '../const'

/**
 * The result of processing files.
 */
export interface ProcessResult {
	tasks: Promise<SetOfBlocks>[];
	processedCount: number;
	skippedCount: number;
}

/**
 * Processes the given files and returns an array of promises that resolve to TranslationStrings.
 *
 * @param patterns
 * @param {Args} args - The arguments for processing the files.
 * @param progressBar - The progress bar element.
 * @return {Promise<ProcessResult>} - The tasks and file counts.
 */
export async function processFiles(
	patterns: Patterns,
	args: Args,
	progressBar?: SingleBar,
): Promise<ProcessResult> {
	const tasks: Promise<SetOfBlocks>[] = [];
	let processedCount = 0;
	let skippedCount = 0;

	const files = await getFiles(args, patterns);

	if (progressBar) {
		progressBar.setTotal(files.length);
		progressBar.update(0, {
			filename: `Found ${files.length} files`,
		});
	}

	// Loop through the array
	for (const file of files) {
		const filename = path.basename(file);
		const ext = path.extname(file).replace(/^./, "");
		const fileRealPath = path.resolve(args.paths.cwd, file);

		if (filename === "theme.json" || filename === "block.json") {
			processedCount++;
			tasks.push(
				readFileAsync(fileRealPath).then((sourceCode) =>
					parseJsonCallback(sourceCode, args.paths.cwd, filename),
				),
			);
		} else if (allowedFormats.includes(ext)) {
			processedCount++;
			const fileTree = readFileAsync(fileRealPath).then((content) =>
				doTree(content, file, args.debug, args),
			);
			if (fileTree) {
				tasks.push(fileTree as Promise<SetOfBlocks>);
			}
		} else {
			skippedCount++;
		}

		if (progressBar) {
			progressBar.update(processedCount + skippedCount, {
				filename: `${path.basename(file)} (Processed: ${processedCount} | Skipped: ${skippedCount})`,
			});
		}
	}

	return { tasks, processedCount, skippedCount };
}
