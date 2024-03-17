import { describe, expect } from '@jest/globals'
import { doTree } from '../src/parser/tree'
import path from 'path'

import fs from 'fs'

describe('doTree tsx file', () => {
	const filepath = 'tests/fixtures/block/SvgControls.tsx'
	let filePath: string
	let fileContent: string
	beforeAll(() => {
		filePath = path.join(process.cwd(), filepath)
		console.log('My file path is: ' + filePath)
		fileContent = fs.readFileSync(filePath, 'utf8')
	})
	test('Should parse TSX file and extract strings', () => {
		const fileParsed = doTree(fileContent, filepath)
		expect(fileParsed).toMatchSnapshot()
	})
})
