import { describe, expect } from '@jest/globals'
import { parseJsonFile } from '../src/extractors/json'
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
			'block description': {
				description: {
					comments: {
						reference: 'block/block.json',
					},
					msgctxt: 'block description',
					msgid: 'description',
					msgstr: [],
				},
			},
			'block keyword': {
				undefined: {
					comments: {
						reference: 'block/block.json',
					},
					msgctxt: 'block keyword',
					msgid: undefined,
					msgstr: [],
				},
			},
			'block title': {
				title: {
					comments: {
						reference: 'block/block.json',
					},
					msgctxt: 'block title',
					msgid: 'title',
					msgstr: [],
				},
			},
		}

		const result = await parseJsonFile({
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
