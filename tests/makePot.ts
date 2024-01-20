import { describe, expect } from '@jest/globals'
import { Args, DomainType } from '../src/types'
import { runExtract } from '../src/parser'

const args = {
	paths: { cwd: 'tests/fixtures/', out: 'tests/fixtures/' },
	slug: 'plugin-slug',
	domain: 'plugin' as DomainType,
}
describe('makePot', () => {
	it('Should build pot file', async () => {
		const dataExtracted = runExtract({
			...args,
			patterns: {
				include: ['file.php'],
				exclude: ['node_modules', 'dist'],
			},
		} as Args)
		expect(dataExtracted).toMatchSnapshot()
	})
})
describe('makePot block json', () => {
	it('Should build pot file from fixtures', async () => {
		const dataExtracted = runExtract({
			...args,
			patterns: {
				include: ['block.json'],
				exclude: ['node_modules', 'dist'],
			},
		} as Args)
		expect(dataExtracted).toMatchSnapshot()
	})
})
describe('makePot plugin', () => {
	it('Should build pot file from fixtures/plugin', async () => {
		const dataExtracted = runExtract({
			...args,
			sourceDirectory: 'tests/fixtures/theme/',
			patterns: {
				include: ['**/*.css'],
				exclude: ['node_modules', 'dist'],
			},
		} as Args)
		expect(dataExtracted).toMatchSnapshot()
	})
})
