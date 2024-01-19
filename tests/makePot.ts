import { describe, expect } from '@jest/globals'

import { Args, DomainType } from '../src/types'
import { runExtract } from '../src/parser'

const args = {
	sourceDirectory: 'tests/fixtures/',
	slug: 'plugin-slug',
	domain: 'plugin' as DomainType,
}
describe('makePot', () => {
	it('Should build pot file', async () => {
		const dataExtracted = runExtract({
			...args,
			sourceDirectory: 'tests/fixtures/',
			include: ['file.php'],
			exclude: ['node_modules', 'dist'],
		} as Args)
		expect(dataExtracted).toMatchSnapshot()
	})
})
describe('makePot block', () => {
	it('Should build pot file from fixtures', async () => {
		const dataExtracted = runExtract({
			...args,
			sourceDirectory: 'tests/fixtures/block/',
			include: ['block.json'],
			exclude: ['node_modules', 'dist'],
			domain: 'theme',
		} as Args)
		expect(dataExtracted).toMatchSnapshot()
	})
})
describe('makePot plugin', () => {
	it('Should build pot file from fixtures/plugin', async () => {
		const dataExtracted = runExtract({
			...args,
			sourceDirectory: 'tests/fixtures/theme/',
			include: ['**/*.css'],
			exclude: ['node_modules', 'dist'],
		} as Args)
		expect(dataExtracted).toMatchSnapshot()
	})
})
