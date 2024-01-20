import { doTree } from '../src/extractors'
import path from 'path'

import fs from 'fs'

// @ts-ignore
import Ts from 'tree-sitter-typescript'

describe('doTree', () => {
	it('Should parse TSX file and extract strings', async () => {
		const fileContent = fs.readFileSync(
			path.join(process.cwd(), 'tests/fixtures/block/SvgControls.tsx'),
			'utf8'
		)
		const fileParsed = doTree(fileContent, Ts?.tsx, 'SvgControls.tsx')
		console.log(fileContent.slice(0, 500), fileParsed)
		expect(fileParsed).toMatchSnapshot()
	})
})
