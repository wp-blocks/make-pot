import * as path from 'path'
import { readFileAsync } from '../fs'
import { parseJsonCallback } from './json'
import { doTree } from '../parser/tree'
import { SetOfBlocks } from 'gettext-merger'
import { allowedFiles } from '../const'

/**
 * Parse a file and extract strings asynchronously
 *
 * @return {Promise<SetOfBlocks>}
 */
export async function parseFile(
	file: string,
	filePath: string = ''
): Promise<SetOfBlocks | undefined> {
	const filename = path.basename(file)
	const ext = path.extname(file).replace(/^./, '')
	const fileRealPath = path.resolve(filePath, file)

	if (ext === 'json') {
		if (filename === 'theme.json' || filename === 'block.json') {
			return readFileAsync(fileRealPath).then(async (sourceCode) => {
				return await parseJsonCallback(sourceCode, filePath, filename)
			})
		}
	}

	if (allowedFiles.includes(ext)) {
		// read the file
		return readFileAsync(fileRealPath).then((sourceCode) => {
			return doTree(sourceCode, file)
		})
	}
}
