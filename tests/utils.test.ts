import { describe, expect } from '@jest/globals'
import { detectPatternType } from '../src/utils'

describe('detectPatternType', () => {
	test('should return "file" when pattern has an extension and no directory separator', () => {
		expect(detectPatternType('example.txt')).toBe('file')
	})

	test('should return "directory" when pattern has no extension and no directory separator', () => {
		expect(detectPatternType('example')).toBe('directory')
	})

	test('should return "glob" when pattern ends with a directory separator', () => {
		expect(detectPatternType('example/')).toBe('glob')
	})

	test('should return "glob" when pattern contains an asterisk', () => {
		expect(detectPatternType('*.txt')).toBe('glob')
	})

	test('should return "file" when pattern has directory separator and extension', () => {
		expect(detectPatternType('folder/example.txt')).toBe('file')
	})

	test('should return "glob" when pattern is a complex glob pattern', () => {
		expect(detectPatternType('folder/**/*.txt')).toBe('glob')
	})
})
