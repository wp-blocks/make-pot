import { describe, expect } from '@jest/globals'
import { doTree } from '../src/parser/tree'
import path from 'path'

import fs from 'fs'

describe('doTree tsx file', () => {
	test('Should parse TSX file and extract strings', () => {
		const fileContent = fs.readFileSync(
			path.join(process.cwd(), 'tests/fixtures/block/SvgControls.tsx'),
			'utf8'
		)
		const fileParsed = doTree(fileContent, 'SvgControls.tsx')
		expect(fileParsed).toMatchSnapshot()
	})
})
