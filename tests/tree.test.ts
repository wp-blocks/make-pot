import { describe, expect } from '@jest/globals'
import { doTree } from '../src/extractors'
import fs from 'fs'
import path from 'path'
// @ts-expect-error unused
import Js from 'tree-sitter-javascript'
// @ts-expect-error unused
import Php from 'tree-sitter-php'
// @ts-expect-error unused
import Ts from 'tree-sitter-typescript'

describe('doTree', () => {
	it('Should build pot file', async () => {
		const fileParsed = doTree(
			fs.readFileSync(
				path.join(__dirname, 'fixtures/sourcedir/file.php'),
				'utf8'
			),
			Php,
			'sourcedir/file.php'
		)
		console.log(fileParsed)
		expect(fileParsed).toMatchSnapshot()
	})
	it('Should parse js', async () => {
		const fileParsed = doTree(
			fs.readFileSync(
				path.join(__dirname, 'fixtures/block/javascript.js'),
				'utf8'
			),
			Js,
			'block/javascript.js'
		)
		console.log(fileParsed)
		expect(fileParsed).toMatchSnapshot()
	})
	it('Should parse TSX file and extract strings', async () => {
		const fileParsed = doTree(
			fs.readFileSync(
				path.join(__dirname, 'fixtures/block/SvgControls.tsx'),
				'utf8'
			),
			Ts.tsx,
			'SvgControls.tsx'
		)
		console.log(fileParsed)
		expect(fileParsed).toMatchSnapshot()
	})
})
