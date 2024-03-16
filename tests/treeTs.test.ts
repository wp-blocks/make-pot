import { describe, expect } from '@jest/globals'
import { doTree } from '../src/parser/tree'
import path from 'path'

import fs from 'fs'

describe('doTree tsx file', () => {
	let fileContent: string
	beforeAll(() => {
		fileContent = fs.readFileSync(
			path.join(process.cwd(), 'tests/fixtures/block/SvgControls.tsx'),
			'utf8'
		)
	})
	test('Should parse TSX file and extract strings', () => {
		const fileParsed = doTree(fileContent, 'SvgControls.tsx')
		expect(fileParsed).toMatchSnapshot()
	})
})
