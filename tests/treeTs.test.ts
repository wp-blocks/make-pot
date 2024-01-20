import { doTree } from '../src/tree'
import path from 'path'

import fs from 'fs'

describe('doTree', () => {
	it('Should parse TSX file and extract strings', async () => {
		const fileContent = fs.readFileSync(
			path.join(process.cwd(), 'tests/fixtures/block/SvgControls.tsx'),
			'utf8'
		)
		const fileParsed = doTree(fileContent, 'SvgControls.tsx')
		console.log(fileContent.slice(0, 500), fileParsed)
		expect(fileParsed).toMatchSnapshot()
	})
})
