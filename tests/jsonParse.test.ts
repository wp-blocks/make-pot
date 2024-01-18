import { describe, expect } from '@jest/globals'
import { parseJsonFile } from '../src/extractors-json'

describe('consolidateTranslations', () => {
	it('should output translation strings with translator comments', async () => {
		const expected = {
			'': {
				undefined: {
					comments: {
						reference: './tests/fixtures/block/block.json',
					},
					msgstr: [],
				},
			},
			'[object Object]': {
				undefined: {
					comments: {
						reference: './tests/fixtures/block/block.json',
					},
					msgctxt: {
						description: 'block variation description',
						keywords: ['block variation keyword'],
						title: 'block variation title',
					},
					msgstr: [],
				},
			},
			'block keyword': {
				undefined: {
					comments: {
						reference: './tests/fixtures/block/block.json',
					},
					msgctxt: 'block keyword',
					msgstr: [],
				},
			},
		}

		const result = await parseJsonFile({
			filepath: './tests/fixtures/block/block.json',
		})

		expect(result).toEqual(expected)
	})

	it('should output translation strings with translator comments', async () => {
		const expected = {
			'': {
				undefined: {
					comments: {
						reference: './tests/fixtures/block/block.json',
					},
					msgstr: [],
				},
			},
			'[object Object]': {
				undefined: {
					comments: {
						reference: './tests/fixtures/block/block.json',
					},
					msgctxt: {
						description: 'block variation description',
						keywords: ['block variation keyword'],
						title: 'block variation title',
					},
					msgstr: [],
				},
			},
			'block keyword': {
				undefined: {
					comments: {
						reference: './tests/fixtures/block/block.json',
					},
					msgctxt: 'block keyword',
					msgstr: [],
				},
			},
		}

		const result = await parseJsonFile({
			filepath: './tests/fixtures/block/block.json',
		})

		expect(result).toEqual(expected)
	})
})
