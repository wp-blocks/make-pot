import { describe, expect } from '@jest/globals'
import { makePot } from '../src/makePot'
import { doTree, parseFile } from '../src/extractors'
// @ts-expect-error
import Js from 'tree-sitter-javascript'
// @ts-expect-error
import Php from 'tree-sitter-php'
// @ts-expect-error
import Ts from 'tree-sitter-typescript'
import { Args } from '../src/types'
import fs from 'fs'
import path from 'path'

const argv = {
	sourceDirectory: 'tests/fixtures/sourcedir',
}

describe('makePot', () => {
	it('Should build pot file', () => {
		makePot({ ...argv, sourceDirectory: 'tests/fixtures/sourcedir' } as Args)
	})
})

describe('makePot Theme', () => {
	it('Should build pot file from fixtures', () => {
		makePot({
			...argv,
			sourceDirectory: 'tests/fixtures/theme',
			domain: 'theme',
		} as Args)
	})
})

describe('makePot Plugin', () => {
	it('Should build pot file from fixtures', () => {
		makePot({ ...argv, sourceDirectory: 'tests/fixtures/plugin' } as Args)
	})
})

describe('parse PHP file and extract strings', () => {
	it('Should build pot file', async () => {
		const fileParsed = doTree(
			fs.readFileSync(path.join(__dirname, './fixtures/sourcedir/file.php'), 'utf8'),
			Php,
			'php.php'
		)
		console.log(fileParsed)
		expect(fileParsed).toMatchSnapshot()
	})
})
describe('parse JS file and extract strings', () => {
	it('Should parse js', async () => {
		const fileParsed = doTree(
			fs.readFileSync(path.join(__dirname, './fixtures/block/javascript.js'), 'utf8'),
			Php,
			'javascript.js'
		)
		console.log(fileParsed)
		expect(fileParsed).toMatchSnapshot()
	})
})
describe('parse TSX file and extract strings', () => {
	it('Should parse TSX file and extract strings', async () => {
		const fileParsed = doTree(
			fs.readFileSync(path.join(__dirname, './fixtures/block/SvgControls.tsx'), 'utf8'),
			Php,
			'SvgControls.tsx'
		)
		console.log(fileParsed)
		expect(fileParsed).toMatchSnapshot()
	})
})
describe('parse block.json file and extract strings', () => {
	it('Should parse block.json file and extract strings', async () => {
		const fileParsed = doTree(
			fs.readFileSync(path.join(__dirname, './fixtures/block/block.json'), 'utf8'),
			Php,
			'block.json'
		)
		console.log(fileParsed)
		expect(fileParsed).toMatchSnapshot()
	})
})
