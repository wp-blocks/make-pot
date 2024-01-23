import { describe, expect } from '@jest/globals'
import { getStrings } from '../src/parser'
import { Args, DomainType } from '../src/types'
import { getFiles } from '../src/glob'

const args: Args = {
	slug: 'plugin-slug',
	paths: { cwd: 'tests/fixtures/sourcedir/', out: 'tests/fixtures/' },
	domain: 'plugin' as DomainType,
	patterns: {
		include: ['**'],
		exclude: [
			'node_modules',
			'vendor',
			'dist',
			'tests',
			'package-lock.json',
		],
	},
}

describe('getStrings', () => {
	it('Should build pot file', async () => {
		const files = await getFiles(args as Args, {
			include: ['file.php'],
			exclude: ['node_modules', 'dist'],
		})
		const dataExtracted = await getStrings({ ...args } as Args, files)

		expect(dataExtracted).toMatchSnapshot()
	})
	it('Should build pot file from fixtures block.json', async () => {
		const currentArgs = {
			...args,
			paths: { cwd: 'tests/fixtures/block/', out: 'tests/fixtures/' },
			patterns: {
				include: ['block.json'],
				exclude: ['node_modules'],
			},
		} as Args
		const files = await getFiles(currentArgs as Args, currentArgs.patterns)
		const dataExtracted = await getStrings(currentArgs as Args, files)

		const expected = {
			'block variation keyword': {
				undefined: {
					msgstr: [],
					msgid: 'undefined',
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
		expect(dataExtracted).toMatchObject(expected)
	})
})
