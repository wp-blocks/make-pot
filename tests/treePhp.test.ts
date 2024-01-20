import { doTree } from '../src/extractors'
import path from 'path'
import fs from 'fs'

// @ts-ignore
import Php from 'tree-sitter-php'

describe('doTree', () => {
	it('Should build pot file', async () => {
		const filePath = path.join(
			process.cwd(),
			'tests/fixtures/sourcedir/file.php'
		)
		const fileContent = fs.readFileSync(filePath, 'utf8')
		console.log('My file path is: ' + filePath)
		console.log('the content is : ' + fileContent.slice(0, 500))
		console.log('the parser is : ' + Php)
		const fileParsed = doTree(fileContent, Php, 'tests/fixtures/php.php')
		console.log(fileContent.slice(0, 500), fileParsed)
		expect(fileParsed).toMatchSnapshot()
	})

	it('Should build pot file php', async () => {
		const fileContent = fs.readFileSync(
			path.join(process.cwd(), 'tests/fixtures/sourcedir/file.php'),
			'utf8'
		)
		const fileParsed = doTree(
			fileContent,
			Php,
			'tests/fixtures/sourcedir/file.php'
		)
		console.log(fileContent.slice(0, 500), fileParsed)
		expect(fileParsed).toMatchSnapshot()
	})
})
