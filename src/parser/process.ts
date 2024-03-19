import type { Args, Patterns } from '../types'
import cliProgress, { SingleBar } from 'cli-progress'
import { allowedFiles } from '../const'
import { SetOfBlocks } from 'gettext-merger'
import path from 'path'
import { readFileAsync } from '../fs'
import { parseJsonCallback } from '../extractors/json'
import { doTree } from './tree'
import { getFiles } from '../fs/glob'

/**
 * Initializes a progress bar and returns the progress bar element.
 *
 * @param {Args} args - The argument object containing the source directory and other options.
 * @param {number} filesCount - An array of file names.
 * @return {cliProgress.SingleBar} The progress bar element.
 */
function initProgress(args: Args, filesCount: number): SingleBar | undefined {
	if (args.options?.silent) return undefined
	// Set up the progress bar
	const progressBar = new cliProgress.SingleBar(
		{
			clearOnComplete: true,
			etaBuffer: 1000,
			hideCursor: true,
			format: ' {bar} {percentage}% | ETA: {eta}s | {filename} | {value}/{total}',
		},
		cliProgress.Presets.shades_classic
	)

	progressBar.start(filesCount, 0)

	// Return the progress bar element
	return progressBar
}

/**
 * Processes the given files and returns an array of promises that resolve to TranslationStrings.
 *
 * @param patterns
 * @param {Args} args - The arguments for processing the files.
 * @return {Promise<SetOfBlocks[]>} - An array of promises that resolve to TranslationStrings.
 */
export async function processFiles(
	patterns: Patterns,
	args: Args
): Promise<Promise<SetOfBlocks>[]> {
	const tasks: Promise<SetOfBlocks>[] = []
	let filesCount = 0

	/**
	 * The progress bar that is used to show the progress of the extraction process.
	 */
	const progressBar: SingleBar | undefined =
		initProgress(args, filesCount) ?? undefined

	const files = getFiles(args, patterns)

	// loop through the files and parse them
	for await (const file of files) {
		filesCount++
		const filename = path.basename(file)
		const ext = path.extname(file).replace(/^./, '')
		const fileRealPath = path.resolve(args.paths.cwd, file)

		if (filename === 'theme.json' || filename === 'block.json') {
			tasks.push(
				readFileAsync(fileRealPath).then(async (sourceCode) => {
					return await parseJsonCallback(
						sourceCode,
						args.paths.cwd,
						filename
					)
				})
			)
		}

		if (allowedFiles.includes(ext)) {
			tasks.push(
				readFileAsync(fileRealPath).then((content) => {
					return doTree(content, file)
				})
			)
		}

		if (progressBar) {
			progressBar.increment(1, {
				filename: file,
			})
		}
	}

	// remove the progress bar
	if (progressBar) progressBar.stop()

	return tasks
}
