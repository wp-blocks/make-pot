import { describe, expect } from '@jest/globals'
import { parseJsonFile } from '../src/extractors-json'
import fs from 'fs'

describe('should parse json', () => {
	it('theme.json', async () => {
		const expected = {
			'block style label': {
				label: {
					comments: {
						reference: 'block/block.json',
					},
					msgctxt: 'block style label',
					msgid: 'label',
					msgstr: [],
				},
			},
			'block variation description': {
				description: {
					comments: {
						reference: 'block/block.json',
					},
					msgctxt: 'block variation description',
					msgid: 'description',
					msgstr: [],
				},
			},
			'block variation keyword': {
				undefined: {
					comments: {
						reference: 'block/block.json',
					},
					msgctxt: 'block variation keyword',
					msgstr: [],
				},
			},
			'block variation title': {
				title: {
					comments: {
						reference: 'block/block.json',
					},
					msgctxt: 'block variation title',
					msgid: 'title',
					msgstr: [],
				},
			},
		}

		const result = parseJsonFile({
			sourceCode: fs.readFileSync(
				'tests/fixtures/block/block.json',
				'utf8'
			),
			filename: 'block.json',
			filepath: 'block/block.json',
		})

		expect(result).toEqual(expected)
	})
})
