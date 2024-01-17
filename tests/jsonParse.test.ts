import { describe, expect } from '@jest/globals'
import { parseJsonFile } from '../src/extractors-json'

describe('consolidateTranslations', () => {
	it('should output translation strings with translator comments', async () => {
		const expected = [
			{
				msgctxt: 'title',
				msgid: 'block title',
				raw: ['title', 'block title'],
				reference: '#: ./tests/fixtures/block/block.json',
				type: 'msgid',
			},
			{
				msgctxt: 'description',
				msgid: 'block description',
				raw: ['description', 'block description'],
				reference: '#: ./tests/fixtures/block/block.json',
				type: 'msgid',
			},
		]

		const result = await parseJsonFile({
			filepath: './tests/fixtures/block/block.json',
		})

		expect(result).toEqual(expected)
	})

	it('should output translation strings with translator comments', async () => {
		const expected = [
			{
				msgctxt: 'title',
				msgid: 'block title',
				raw: ['title', 'block title'],
				reference: '#: ./tests/fixtures/block/block.json',
				type: 'msgid',
			},
			{
				msgctxt: 'description',
				msgid: 'block description',
				raw: ['description', 'block description'],
				reference: '#: ./tests/fixtures/block/block.json',
				type: 'msgid',
			},
		]

		const result = await parseJsonFile({
			filepath: './tests/fixtures/block/block.json',
		})

		expect(result).toEqual(expected)
	})
})
