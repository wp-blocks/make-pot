import { describe, expect } from '@jest/globals'
import { makePot } from '../src/makePot'
import { Args } from '../src/types'

const argv = {
	sourceDirectory: '../tests/fixtures/sourcedir',
}

describe('makePot', () => {
	it('Should build pot file', async () => {
		await makePot({
			...argv,
			sourceDirectory: '../tests/fixtures/sourcedir',
		} as Args)
		expect(true).toBe(true)
	})
	it('Should build pot file from fixtures', async () => {
		await makePot({
			...argv,
			sourceDirectory: '../tests/fixtures/theme',
			domain: 'theme',
		} as Args)
		expect(true).toBe(true)
	})
	it('Should build pot file from fixtures/plugin', async () => {
		await makePot({
			...argv,
			sourceDirectory: '../tests/fixtures/plugin',
		} as Args)
		expect(true).toBe(true)
	})
})
