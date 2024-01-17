import { getFiles } from '../src/parser'
import { DomainType } from '../src/types'

const DEFAULTS = {
	sourceDirectory: './tests/fixtures/',
	slug: 'plugin-slug',
	domain: 'plugin' as DomainType,
	headers: {},
}

describe('getFiles', () => {
	it('should retrieve a all files', async () => {
		const args = DEFAULTS
		const pattern = { include: ['**'], exclude: [] }

		const files = await getFiles(args, pattern)

		expect(files.length).toBeGreaterThan(2)
		expect(files.includes('fse\\theme.json')).toBeTruthy()
	})
	it('should retrieve a list of txt files based on the provided patterns', async () => {
		const args = {
			sourceDirectory: './tests/fixtures/',
			slug: 'plugin-slug',
			domain: 'plugin' as DomainType,
			headers: {},
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

		const files = await getFiles(args, pattern)

		expect(files).toEqual(expectedFiles)
	})
	it('should retrieve a list of theme.json files based on the provided patterns', async () => {
		const args = {
			sourceDirectory: './tests/fixtures/',
			slug: 'plugin-slug',
			domain: 'plugin' as DomainType,
			headers: {},
		}
		const pattern = {
			include: ['theme.json'],
			exclude: ['node_modules'],
		}
		const expectedFiles = ['sourcedir\\theme.json', 'fse\\theme.json']

		const files = await getFiles(args, pattern)
		expect(files).toEqual(expectedFiles)
	})
	it('should retrieve a list of files without any node_modules folder', async () => {
		const args = {
			sourceDirectory: './tests/fixtures/',
			slug: 'plugin-slug',
			domain: 'plugin' as DomainType,
			headers: {},
		}
		const pattern = { include: undefined, exclude: ['node_modules'] }

		const files = await getFiles(args, pattern)

		// for each file check if that strings contains the node_modules folder
		expect(files.find((e) => e.includes('node_modules'))).toBeFalsy()
		expect(files.length).toBeGreaterThan(10)
	})
})
