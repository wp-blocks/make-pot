import { describe, expect } from '@jest/globals'
import { doTree } from '../src/parser/tree'
import fs from 'fs'

import path from 'path'

describe('doTree js', () => {
	it('Should build pot file js', () => {
		const source = path.join(
			process.cwd(),
			'tests/fixtures/block/javascript.js'
		)
		const fileContent = fs.readFileSync(source, 'utf8')
		const fileParsed = doTree(fileContent, 'block/javascript.js')
		expect(fileParsed).toMatchSnapshot()
	})
})
