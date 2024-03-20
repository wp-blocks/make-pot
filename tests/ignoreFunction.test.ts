import { describe, expect } from '@jest/globals'
import { Glob, Path } from 'glob'
import path from 'path'
import { minimatch } from 'minimatch'
import { ignoreFunc } from '../src/fs/glob'

describe('includes or not', () => {
	it('paths includes', () => {
		expect(
			path
				.normalize(
					'D:\\vvv-local\\www\\phpeighttwo\\public_html\\wp-content\\plugins\\makePot\\tests\\fixtures'
				)
				.includes('tests')
		).toBe(true)
		expect(
			path.normalize(
				path.relative(
					'D:\\vvv-local\\www\\phpeighttwo\\public_html\\wp-content\\plugins\\makePot\\tests\\fixtures',
					'tests'
				)
			)
		).toBe('..')
		expect(
			minimatch(path.normalize('block/SvgControls.tsx'), 'block/**')
		).toBe(true)
	})
})

const tests = [
	{
		title: 'defaults',
		src: '.',
		exclude: [
			'.git',
			'node_modules',
			'vendor',
			'build',
			'dist',
			'uploads',
			'Gruntfile.js',
			'webpack.config.js',
			'**/*.min.js',
			'tsconfig.js',
			'**.test.**',
			'tests',
			'coverage',
			'**/extractors**',
			'**/*.js.map',
			'**/lib/c**.d.ts',
			'**/**tt**',
		],
		result: 20,
	},
	{
		title: 'exclude file.php',
		src: 'tests/fixtures/sourcedir',
		exclude: ['file.php'],
		result: [
			'theme.json',
			'svgTools.ts',
			'sourcedir.php',
			'package.json',
			'file2.txt',
			'vendor' + path.sep + 'index.php',
			'node_modules' + path.sep + 'module' + path.sep + 'block.json',
		],
	},
	{
		title: 'exclude node_modules and vendor',
		src: 'tests/fixtures/sourcedir',
		exclude: ['node_modules', 'vendor'],
		result: [
			'theme.json',
			'svgTools.ts',
			'sourcedir.php',
			'package.json',
			'file2.txt',
			'file.php',
		],
	},
	{
		title: 'globstar path',
		src: 'tests/fixtures',
		exclude: ['**/*.php', '**/*.json', 'block/**'],
		result: 15,
	},
	{
		title: 'should exclude globstar',
		src: 'tests/fixtures/',
		exclude: ['**'],
		result: [],
	},
	{
		title: 'should remove excluded patterns',
		src: 'tests/fixtures/node_modules',
		exclude: [],
		result: ['block.json'],
	},
]

describe('testing the ignoreFunc used to ignore files', () => {
	tests.forEach((test) => {
		it('should ignore files ' + test.title, () => {
			const foundDirs: string[] = []

			const dirs = new Glob('**', {
				ignore: {
					ignored: (p: Path) => ignoreFunc(p, test.exclude),
				},
				nodir: true,
				cwd: path.join(process.cwd(), test.src),
			})

			for (const dir of dirs) {
				foundDirs.push(dir)
			}

			if (typeof test.result === 'number') {
				expect(foundDirs.length).toBeGreaterThanOrEqual(test.result)
			} else {
				expect(foundDirs).toStrictEqual(test.result)
			}
		})
	})
})
