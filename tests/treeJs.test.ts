import { doTree } from '../src/extractors'

import fs from 'fs'

import path from 'path'

// @ts-ignore
import Javascript from 'tree-sitter-javascript'

describe('doTree', () => {
	it('Should build pot file js', async () => {
		const fileContent = fs.readFileSync(
			path.join(process.cwd(), 'tests/fixtures/block/javascript.js'),
			'utf8'
		)
		const fileParsed = doTree(
			fileContent,
			Javascript,
			'block/javascript.js'
		)
		console.log(fileContent.slice(0, 500), fileParsed)
		expect(fileParsed).toMatchSnapshot()
	})
})
