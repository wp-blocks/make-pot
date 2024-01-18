import { describe, expect } from '@jest/globals'
import { getStrings } from '../src/parser'
import { Args, DomainType } from '../src/types'
import path from 'path'

const args = {
	sourceDirectory: './tests/fixtures/',
	slug: 'plugin-slug',
	domain: 'plugin' as DomainType,
}

describe('getStrings', () => {
	it('Should build pot file', async () => {
		const dataExtracted = await getStrings(
			{ ...args, sourceDirectory: './tests/fixtures/' } as Args,
			{
				include: ['file.php'],
				exclude: ['node_modules', 'dist'],
			}
		)
		const expected = {
			'': {
				sdasdasdasd: {
					msgid: 'sdasdasdasd',
					msgid_plural: undefined,
					msgstr: [],
				},
				'strong magenta': {
					msgid: 'strong magenta',
					msgid_plural: undefined,
					msgstr: [],
				},
				'light grayish magenta': {
					msgid: 'light grayish magenta',
					msgid_plural: undefined,
					msgstr: [],
				},
				'very light gray': {
					msgid: 'very light gray',
					msgid_plural: undefined,
					msgstr: [],
				},
				'very dark gray': {
					msgid: 'very dark gray',
					msgid_plural: undefined,
					msgstr: [],
				},
				'Vivid cyan blue to vivid purple': {
					msgid: 'Vivid cyan blue to vivid purple',
					msgid_plural: undefined,
					msgstr: [],
				},
				'Vivid green cyan to vivid cyan blue': {
					msgid: 'Vivid green cyan to vivid cyan blue',
					msgid_plural: undefined,
					msgstr: [],
				},
				'Light green cyan to vivid green cyan': {
					msgid: 'Light green cyan to vivid green cyan',
					msgid_plural: undefined,
					msgstr: [],
				},
				'Luminous vivid amber to luminous vivid orange': {
					msgid: 'Luminous vivid amber to luminous vivid orange',
					msgid_plural: undefined,
					msgstr: [],
				},
				'Luminous vivid orange to vivid red': {
					msgid: 'Luminous vivid orange to vivid red',
					msgid_plural: undefined,
					msgstr: [],
				},
				Small: {
					msgid: 'Small',
					msgid_plural: undefined,
					msgstr: [],
				},
				Regular: {
					msgid: 'Regular',
					msgid_plural: undefined,
					msgstr: [],
				},
				Large: {
					msgid: 'Large',
					msgid_plural: undefined,
					msgstr: [],
				},
				Huge: {
					msgid: 'Huge',
					msgid_plural: undefined,
					msgstr: [],
				},
			},
		}
		console.log('Done', dataExtracted)
		expect(dataExtracted).toMatchObject(expected)
	})
	it('Should build pot file from fixtures', async () => {
		const dataExtracted = await getStrings(
			{
				...args,
				sourceDirectory: './tests/fixtures/block/',
				domain: 'theme',
			} as Args,
			{
				include: ['block.json'],
				exclude: ['node_modules', 'dist'],
			}
		)
		const expected = {
			'block variation keyword': {
				undefined: {
					msgstr: [],
					msgid: undefined,
					msgctxt: 'block variation keyword',
				},
			},
			'block variation title': {
				title: {
					msgstr: [],
					msgid: 'title',
					msgctxt: 'block variation title',
				},
			},
			'block variation description': {
				description: {
					msgstr: [],
					msgid: 'description',
					msgctxt: 'block variation description',
				},
			},
			'block style label': {
				label: {
					msgstr: [],
					msgid: 'label',
					msgctxt: 'block style label',
				},
			},
		}
		console.log('Done', dataExtracted)
		expect(dataExtracted).toMatchObject(expected)
	})
})
