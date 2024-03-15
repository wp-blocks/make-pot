import type { Args, TranslationStrings } from '../types'
import cliProgress, { SingleBar } from 'cli-progress'
import { Glob } from 'glob'
import { allowedFiles } from '../const'
import { parseFile } from '../extractors'

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
 * @param {Glob<{ cwd: string }>} files - The files to process.
 * @param {Args} args - The arguments for processing the files.
 * @param {SingleBar} [progressBar] - An optional progress bar for tracking the progress of file processing.
 * @return {Promise<TranslationStrings>[]} - An array of promises that resolve to TranslationStrings.
 */
function processFiles(
	files: Glob<{ cwd: string }>,
	args: Args,
	progressBar?: SingleBar
): Promise<TranslationStrings>[] {
	const tasks: Promise<TranslationStrings>[] = []

	// loop through the files and parse them
	for (const file of files) {
		// get the file extension
		const ext = file.split('.').pop() || undefined

		// check if the extension is allowed
		if (!ext || !allowedFiles.includes(ext)) {
			// log the filepath
			if (progressBar) {
				progressBar.increment(1, {
					filename: `Skipping ${ext} file: ${file}`,
				})
			}
			continue
		}

		const task = parseFile(file, args.paths.cwd).finally(() => {
			if (progressBar) {
				progressBar.increment(1, {
					filename: file,
				})
			}
		})

		// add the task to the array if it's not null
		if (task !== null) {
			tasks.push(task as Promise<TranslationStrings>)
		}
	}

	return tasks
}

/**
 * Retrieves an array of translation strings from files that match the specified arguments and pattern.
 *
 * @param {Args} args - The arguments to specify which files to search and parse.
 * @param {string[]} files - An array of file names to search and parse.
 * @return {Promise<TranslationStrings[]>} A promise that resolves to an array of translation strings found in the files.
 */
export async function getStrings(
	args: Args,
	files: Glob<{ cwd: string }>
): Promise<TranslationStrings[]> {
	/**
	 * The progress bar that is used to show the progress of the extraction process.
	 */
	let progressBar: SingleBar | undefined = undefined
	progressBar =
		initProgress(args, Array.from(files.iterateSync()).length) ?? undefined

	return await Promise.all(processFiles(files, args, progressBar)).finally(
		() => {
			if (progressBar) {
				progressBar.stop()
			}
		}
	)
}
