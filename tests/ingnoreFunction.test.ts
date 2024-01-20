import { describe, expect } from '@jest/globals'
import { Glob, Path } from 'glob'
import { ignoreFunc } from '../src/glob'
import path from 'path'
import { minimatch } from 'minimatch'

describe('includes or not', () => {
	it('tesing paths includes', () => {
		expect(
			path.relative(
				'D:\\vvv-local\\www\\phpeighttwo\\public_html\\wp-content\\plugins\\makePot\\tests\\fixtures',
				'fixtures'
			)
		).toBe('..\\..\\fixtures')
		expect(
			'D:\\vvv-local\\www\\phpeighttwo\\public_html\\wp-content\\plugins\\makePot\\tests\\fixtures'.includes(
				'tests'
			)
		).toBe(true)
		expect(minimatch('block\\SvgControls.tsx', 'block/**')).toBe(true)
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
		],
		result: ['theme.json', 'svgTools.ts', 'file2.txt', 'file.php'],
	},
	{
		title: 'exclude file.php',
		src: 'tests/fixtures/sourcedir',
		exclude: ['file.php'],
		result: [
			'theme.json',
			'svgTools.ts',
			'plugin-header.php',
			'package.json',
			'file2.txt',
			'vendor\\index.php',
			'node_modules\\module\\block.json',
		],
	},
	{
		title: 'exclude node_modules and vendor',
		src: 'tests/fixtures/sourcedir',
		exclude: ['node_modules', 'vendor'],
		result: [
			'theme.json',
			'svgTools.ts',
			'plugin-header.php',
			'package.json',
			'file2.txt',
			'file.php',
		],
	},
	{
		title: 'globstar path',
		src: 'tests/fixtures',
		exclude: ['**/*.php', '**/*.json', 'block/**'],
		result: [
			'file1.txt',
			'theme\\style.css',
			'sourcedir\\svgTools.ts',
			'sourcedir\\file2.txt',
			'fse\\style.css',
			'child-theme\\style.css',
			'Block Patterns\\README.md',
			'Block Patterns\\mother.jpg',
			'Block Patterns\\flora.png',
			'Block Patterns\\clothes.jpg',
			'fse\\templates\\single.html',
			'fse\\templates\\search.html',
			'fse\\templates\\page.html',
			'fse\\templates\\index.html',
			'fse\\templates\\archive.html',
			'fse\\parts\\header.html',
			'fse\\parts\\footer.html',
		],
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
				console.log('dir', dir)
				foundDirs.push(dir)
			}

			expect(foundDirs).toStrictEqual(test.result)
		})
	})
})
