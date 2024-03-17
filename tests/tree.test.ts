import { describe, expect } from '@jest/globals'
import { doTree } from '../src/parser/tree'
import fs from 'fs'

import path from 'path'

describe('doTree js', () => {
	const filepath = 'tests/fixtures/block/javascript.js'
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

describe('doTree php', () => {
	const filepath = 'tests/fixtures/sourcedir/file.php'
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
