import { doTree } from '../src/tree'

import fs from 'fs'

import path from 'path'

describe('doTree', () => {
	it('Should build pot file js', async () => {
		const fileContent = fs.readFileSync(
			path.join(process.cwd(), 'tests/fixtures/block/javascript.js'),
			'utf8'
		)
		const fileParsed = doTree(fileContent, 'block/javascript.js')
		console.log(fileContent.slice(0, 500), fileParsed)
		expect(fileParsed).toMatchSnapshot()
	})
})
