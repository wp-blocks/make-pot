import { describe, expect } from '@jest/globals'
import { doTree } from '../src/parser/tree'
import path from 'path'

import fs from 'fs'

describe('doTree tsx file', () => {
	test('Should parse TSX file and extract strings', () => {
		const filePath = path.join(
			process.cwd(),
			'tests/fixtures/block/SvgControls.tsx'
		)
		console.log('My file path is: ' + filePath)
		const fileContent = fs.readFileSync(filePath, 'utf8')
		const fileParsed = doTree(fileContent, 'SvgControls.tsx')
		expect(fileParsed).toMatchSnapshot()
	})
})
