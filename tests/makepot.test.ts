import { describe, expect } from '@jest/globals'
import { makePot } from '../src/makePot'
import { Args } from '../src/types'

const argv = {
	sourceDirectory: 'tests/fixtures/sourcedir',
}

describe('makePot', () => {
	it('Should build pot file', () => {
		makePot({
			...argv,
			sourceDirectory: 'tests/fixtures/sourcedir',
		} as Args)
	})
	it('Should build pot file from fixtures', () => {
		makePot({
			...argv,
			sourceDirectory: 'tests/fixtures/theme',
			domain: 'theme',
		} as Args)
	})
	it('Should build pot file from fixtures/plugin', () => {
		makePot({ ...argv, sourceDirectory: 'tests/fixtures/plugin' } as Args)
	})
})
