import { describe, expect } from '@jest/globals'
import { consolidate } from '../src/parser/consolidate'
import { GetTextComment } from 'gettext-parser'

describe('consolidate', () => {
	it('should consolidate strings with translator comments', () => {
		const translationStrings = {
			'': {
				'': {
					msgid: '',
					msgstr: [
						'Content-Type: text/plain; charset=iso-8859-1\n...',
					],
				},
			},
			'': {
				a: {
					msgid: '',
					msgstr: ['a'],
				},
			},
			'another context': {
				'%s example': {
					msgctxt: 'another context',
					msgid: '%s example',
					msgid_plural: '%s examples',
					msgstr: ['% näide', '%s näidet'],
					comments: {
						translator: 'This is a regular comment',
						reference: '/path/to/file:123',
					} as GetTextComment,
				},
			},
		}
		const translationStrings2 = {
			'': {
				'': {
					msgid: '',
					msgstr: [
						'Content-Type: text/plain; charset=iso-8859-1\n...',
					],
				},
			},
		}
		// eslint-disable-next-line
		const expected = {
			'': {
				'': {
					msgid: '',
					msgstr: [
						'Content-Type: text/plain; charset=iso-8859-1\n...',
					],
				},
				a: {
					msgid: 'a',
					msgstr: ['a'],
				},
			},
			'another context': {
				'%s example': {
					comments: {
						reference: '/path/to/file:123',
						translator: 'This is a regular comment',
					},
					msgctxt: 'another context',
					msgid: '%s example',
					msgid_plural: '%s examples',
					msgstr: ['% näide', '%s näidet'],
				},
			},
		}

		const result = consolidate([translationStrings, translationStrings2])

		expect(result).toMatchObject(expected)
	})
})
