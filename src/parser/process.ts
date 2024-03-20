import type { Args, Patterns } from '../types'
import { SingleBar } from 'cli-progress'
import { allowedFiles } from '../const'
import { SetOfBlocks } from 'gettext-merger'
import path from 'path'
import { readFileAsync } from '../fs'
import { parseJsonCallback } from '../extractors/json'
import { doTree } from './tree'
import { getFiles } from '../fs/glob'

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
	progressBar?: SingleBar
): Promise<Promise<SetOfBlocks>[]> {
	const tasks: Promise<SetOfBlocks>[] = []
	let filesCount = 0

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

		progressBar?.increment(1, { filename })
		progressBar?.setTotal(filesCount)
	}

	return tasks
}
