import Parser, { type SyntaxNode } from 'tree-sitter'
import { type TranslationStrings } from './types'
import { i18nFunctions } from './const'

import { stripTranslationMarkup } from './utils'
import { GetTextComment, GetTextTranslation } from 'gettext-parser'
import { getParser } from './glob'

/**
 * Parses the source code using the specified language parser and extracts the strings from the file.
 *
 * @param {string} sourceCode - The source code to be parsed.
 * @param {string} filepath - The path to the file being parsed.
 * @return {TranslationStrings[]} An array of translation strings.
 */
export function doTree(
	sourceCode: string,
	filepath: string
): TranslationStrings {
	// set up the parser
	const parser = new Parser()
	parser.setLanguage(getParser(filepath))

	// parse the file
	const tree = parser.parse(sourceCode)

	const gettextTranslations: TranslationStrings = {}
	const typeToMatch =
		filepath.split('.').pop()?.toLowerCase() !== 'php'
			? 'call_expression'
			: 'function_call_expression'

	/**
	 * Traverse the tree 🌳
	 *
	 * @param {SyntaxNode} node The node to traverse through
	 */
	function traverse(node: SyntaxNode): void {
		// Walk the tree
		if (node?.children.length)
			for (const child of node.children) {
				traverse(child)
			}

		// Check if the node matches
		if (node?.type === typeToMatch) {
			// The function name is the first child
			const functionName = node.firstChild?.text ?? null
			if (
				functionName === null ||
				!Object.keys(i18nFunctions).includes(functionName)
			) {
				return
			}

			// The arguments are the last child
			const argsNode = node.lastChild
			if (
				argsNode === null ||
				argsNode.childCount === 0 ||
				argsNode.type !== 'arguments'
			) {
				return
			}

			const [fn, raw] = node.children
			const translation: string[] = []

			// Get the translation from the arguments (the quoted strings)
			// Todo: parse the translations string by type of function "fn"
			raw.children.slice(1, -1).forEach((child) => {
				if (/^["|']/.exec(child.text[0]))
					translation.push(child.text.slice(1, -1))
			})

			// Get the msgid from the translation data
			const gettext: GetTextTranslation = {
				msgid: translation[0],
				msgid_plural: undefined,
				msgstr: [],
				comments: {
					reference: `${filepath}:${node.startPosition.row + 1}`,
				} as GetTextComment,
			}

			if (node.parent?.previousSibling?.type === 'comment') {
				if (
					node.parent?.previousSibling.text
						.toLowerCase()
						.includes('translators:')
				)
					(gettext.comments as GetTextComment).translator =
						stripTranslationMarkup(
							node.parent?.previousSibling.text
						)
			} else {
				const el = node.closest([
					'comment',
					'block_comment',
					'echo',
					typeToMatch,
				])?.previousSibling
				// todo: regex to match insensitive "translators" and ":"
				if (
					el &&
					(el.type === 'comment' || el.type === 'block_comment') &&
					el.text.toLowerCase().includes('translators:')
				)
					(gettext.comments as GetTextComment).translator =
						stripTranslationMarkup(el.text)
			}

			gettextTranslations[gettext.msgctxt ?? ''] = {
				...(gettextTranslations[gettext.msgctxt ?? ''] || {}),
				[gettext.msgid]: gettext,
			}
		}
	}

	traverse(tree.rootNode)

	// Return both matches and entries
	return gettextTranslations
}
