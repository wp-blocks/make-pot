import { getFiles } from '../src/parser'
import { Args, DomainType } from '../src/types'
import { parseCliArgs } from '../src/cliArgs'
import path from 'path'

const DEFAULTS = parseCliArgs({
	silent: true,
	sourceDirectory: 'tests/fixtures',
	slug: 'plugin-slug',
	domain: 'plugin' as DomainType,
	headers: {},
} as Args)

describe('getFiles', () => {
	it('should retrieve a all files', async () => {
		const args = { ...DEFAULTS, domain: 'theme' } as Args
		const pattern = { include: ['**'], exclude: [] }

		const files = await getFiles(args, pattern).then((files) =>
			Array.from(files.iterateSync())
		)
		console.log(files)
		expect(files.length).toBeGreaterThan(2)
		expect(files.find((e) => e.includes('theme.json'))).toBeTruthy()
	})
	it('should retrieve a list of txt files based on the provided plugin pattern', async () => {
		const args = {
			...DEFAULTS,
		}
		const pattern = {
			include: ['**/*.txt'],
			exclude: ['node_modules', 'dist'],
		}
		const expectedFiles = [
			'file1.txt',
			'sourcedir' + path.sep + 'file2.txt',
			'block' + path.sep + 'readme.txt',
		]

		const files = await getFiles(args as Args, pattern).then((files) =>
			Array.from(files.iterateSync())
		)

		expect(files).toEqual(expectedFiles)
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
			'sourcedir' + path.sep + 'theme.json',
			'sourcedir' + path.sep + 'package.json',
			'sourcedir' +
				path.sep +
				'node_modules' +
				path.sep +
				'module' +
				path.sep +
				'block.json',
			'node_modules' + path.sep + 'block.json',
			'fse' + path.sep + 'theme.json',
			'block' + path.sep + 'block.json',
		]

		const files = await getFiles(args as Args, pattern).then((files) =>
			Array.from(files.iterateSync())
		)
		expect(files).toEqual(expectedFiles)
	})
	it('should retrieve a list of files without any node_modules folder', async () => {
		const args = {
			...DEFAULTS,
		}
		const pattern = {
			include: ['**'],
			exclude: ['node_modules'],
		}

		const files = await getFiles(args as Args, pattern).then((files) =>
			Array.from(files.iterateSync())
		)

		console.log(files)

		// for each file check if that strings contains the node_modules folder
		expect(files.find((e) => e.includes('node_modules'))).toBeFalsy()
		expect(files.length).toBeGreaterThan(10)
	})
})
