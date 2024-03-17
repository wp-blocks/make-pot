import { describe, expect } from '@jest/globals'
import { getFiles } from '../src/fs/glob'
import { Args, DomainType } from '../src/types'
import path from 'path'
import { parseCliArgs } from '../src/cli/parseCli'

describe('getFiles', () => {
	const DEFAULTS = parseCliArgs({
		domain: 'plugin' as DomainType,
		slug: 'plugin-slug',
		paths: { cwd: 'tests/fixtures/', out: 'tests/fixtures/' },
		options: {
			silent: true,
		},
		$0: 'makepot',
		_: [0, 1],
	})

	it('should retrieve a all files', async () => {
		const args = { ...DEFAULTS, domain: 'theme' } as Args
		const pattern = { include: ['**'], exclude: [] }

		const files = await getFiles(args, pattern)
		const collected: string[] = []
		for (const file of files) {
			expect(file).toBeTruthy()
			collected.push(file)
		}
		expect(collected.length).toBeGreaterThan(2)
		expect(collected.find((e) => e.includes('theme.json'))).toBeTruthy()
	})
	it('Should retrieve a list of txt files based on the provided plugin pattern', async () => {
		const args = {
			...DEFAULTS,
		}
		const pattern = {
			include: ['**/*.txt'],
			exclude: ['node_modules', 'dist'],
		}
		const expectedFiles = [
			'tests' + path.sep + 'fixtures' + path.sep + 'file1.txt',
			'tests' +
				path.sep +
				'fixtures' +
				path.sep +
				'sourcedir' +
				path.sep +
				'file2.txt',
			'tests' +
				path.sep +
				'fixtures' +
				path.sep +
				'block' +
				path.sep +
				'readme.txt',
		]

		const files = await getFiles(args, pattern)
		const collected: string[] = []
		for (const file of files) {
			expect(file).toBeTruthy()
			collected.push(file)
		}

		expect(collected).toEqual(expectedFiles)
	})
	it('should retrieve a list of theme.json files based on the provided theme pattern', async () => {
		const args = {
			...DEFAULTS,
		}
		const pattern = {
			include: ['**/*.json'],
			exclude: [],
		}
		const expectedFiles = [
			`sourcedir${path.sep}theme.json`,
			`sourcedir${path.sep}package.json`,
			`sourcedir${path.sep}node_modules${path.sep}module${path.sep}block.json`,
			`node_modules${path.sep}block.json`,
			`fse${path.sep}theme.json`,
			`block${path.sep}block.json`,
		]

		const files = await getFiles(args, pattern)
		let collected = []
		for (const file of files) {
			expect(file).toBeTruthy()
			collected.push(file)
		}
		expect(
			collected.filter((file) => !expectedFiles.includes(file))
		).toBeTruthy()
	})
	it('Should retrieve a list of files without any node_modules folder', async () => {
		const args = {
			...DEFAULTS,
		}
		const pattern = {
			include: ['**'],
			exclude: ['node_modules'],
		}

		const files = await getFiles(args, pattern)
		let collected = []
		for (const file of files) {
			expect(file).toBeTruthy()
			collected.push(file)
		}

		// for each file check if that strings contains the node_modules folder
		expect(collected.find((e) => e.includes('node_modules'))).toBeFalsy()
		expect(collected.length).toBeGreaterThan(10)
	})
})
