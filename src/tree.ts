#!/usr/bin/env node
import Parser, { type SyntaxNode } from 'tree-sitter'
// @ts-expect-error
import Js from 'tree-sitter-javascript'
// @ts-expect-error
import Php from 'tree-sitter-php'
// @ts-expect-error
import Ts from 'tree-sitter-typescript'
import { type TranslationString } from './types'
import { i18nFunctions } from './const'

/**
 * Extract strings from a file 🌳
 *
 * @param {Tree} node
 * @param {string} lang
 * @param {string} filename
 * @return {{}}
 */
export function extractStrings(
	node: SyntaxNode,
	lang: Parser | null,
	filename: string
): TranslationString[] {
	const matches: TranslationString[] = []
	const typeToMatch = lang !== Php ? 'call_expression' : 'function_call_expression'

	/**
	 * Traverse the tree 🌳
	 *
	 * @param {SyntaxNode} node The node to traverse through
	 * @param {SyntaxNode|null} previousNode The previous node in the tree
	 */
	function traverse(node: SyntaxNode, previousNode: SyntaxNode | null = null): void {
		if (node.type === typeToMatch) {
			const functionNameNode = node.firstChild
			const functionName = functionNameNode?.text ?? null

			if (functionName === null || !Object.keys(i18nFunctions).includes(functionName)) {
				return
			}

			const argsNode = node.lastChild

			if (argsNode === null || argsNode.childCount === 0 || argsNode.type !== 'arguments') {
				return
			}

			const [fn, raw] = node.children
			const translation: string[] = []
			raw.children.slice(1, -1).forEach((child) => {
				if (child.text !== ',') translation.push(child.text.slice(1, -1))
			})

			let comments

			while (previousNode !== null && previousNode.type !== 'comment') {
				previousNode = previousNode.previousSibling
			}

			if (previousNode?.type === 'comment' && previousNode.text.includes('translators:')) {
				comments = previousNode.text.trim()
			}

			const type = i18nFunctions[fn.text as keyof typeof i18nFunctions] ?? 'text_domain'
			const position = node.startPosition

			matches.push({
				reference: `#: ${filename}:${position.row + 1}`,
				type,
				raw: translation,
				msgid: translation[0],
				comments,
			})
		}

		for (const child of node.children) {
			traverse(child, node)
		}
	}

	traverse(node)

	// Return both matches and entries
	return matches
}

/**
 * Return the parser based on the file extension
 *
 * @param file - Path to the file
 * @return {Parser|{}|null} - the parser to be used with the file or null if no parser is found
 */
export function getParser(file: string): string | Parser {
	const ext = file.split('.').pop()
	switch (ext) {
		case 'ts':
			return Ts.typescript
		case 'tsx':
			return Ts.tsx
		case 'js':
		case 'jsx':
		case 'mjs':
		case 'cjs':
			return Js
		case 'php':
			return Php
		default:
			return ext!
	}
}
