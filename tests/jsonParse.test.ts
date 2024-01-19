import { describe, expect } from '@jest/globals'
import { parseJsonFile } from '../src/extractors-json'
import { Args } from '../src/types'
import path from 'path'
import fs from 'fs'

describe('consolidateTranslations', () => {
	it('should output translation strings with translator comments', async () => {
		const expected = {
			'block style label': {
				label: {
					comments: {
						reference: 'tests/fixtures/block/block.json',
					},
					msgctxt: 'block style label',
					msgid: 'label',
					msgstr: [],
				},
			},
			'block variation description': {
				description: {
					comments: {
						reference: 'tests/fixtures/block/block.json',
					},
					msgctxt: 'block variation description',
					msgid: 'description',
					msgstr: [],
				},
			},
			'block variation keyword': {
				undefined: {
					comments: {
						reference: 'tests/fixtures/block/block.json',
					},
					msgctxt: 'block variation keyword',
					msgstr: [],
				},
			},
			'block variation title': {
				title: {
					comments: {
						reference: 'tests/fixtures/block/block.json',
					},
					msgctxt: 'block variation title',
					msgid: 'title',
					msgstr: [],
				},
			},
		}

		const result = await parseJsonFile({
			filepath: 'tests/fixtures/block/block.json',
			filename: 'block.json',
			sourceCode: fs.readFileSync(
				'tests/fixtures/block/block.json',
				'utf8'
			),
		})

		expect(result).toEqual(expected)
	})
})