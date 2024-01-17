import { getFiles } from '../src/parser'
import { Args, DomainType, Patterns } from '../src/types'

const DEFAULTS = {
	silent: true,
	sourceDirectory: './tests/fixtures/',
	slug: 'plugin-slug',
	domain: 'plugin' as DomainType,
	headers: {},
}

describe('getFiles', () => {
	it('should retrieve a all files', async () => {
		const args = DEFAULTS as Args
		const pattern = { include: ['**'], exclude: [] }

		const files = await getFiles(args, pattern).then((files) =>
			Array.from(files.iterateSync())
		)
		expect(files.length).toBeGreaterThan(2)
		expect(files.includes('fse\\theme.json')).toBeTruthy()
	})
	it('should retrieve a list of txt files based on the provided patterns', async () => {
		const args = {
			...DEFAULTS,
		}
		const pattern = {
			include: ['**/*.txt'],
			exclude: ['node_modules', 'dist'],
		}
		const expectedFiles = [
			'file1.txt',
			'sourcedir\\file2.txt',
			'block\\readme.txt',
		]

		const files = await getFiles(args as Args, pattern).then((files) =>
			Array.from(files.iterateSync())
		)

		expect(files).toEqual(expectedFiles)
	})
	it('should retrieve a list of theme.json files based on the provided patterns', async () => {
		const args = {
			...DEFAULTS,
		}
		const pattern = {
			include: ['theme.json'],
			exclude: ['node_modules'],
		}
		const expectedFiles = ['sourcedir\\theme.json', 'fse\\theme.json']

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
