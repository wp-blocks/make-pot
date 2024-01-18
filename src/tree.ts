import Parser, { type SyntaxNode } from 'tree-sitter'
import { type TranslationStrings } from './types'
import { i18nFunctions } from './const'

// @ts-expect-error
import Php from 'tree-sitter-php'
import { stripTranslationMarkup } from './utils'
import { GetTextComment, GetTextTranslation } from 'gettext-parser'

/**
 * Extract strings from a file
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
) {
	const gettextTranslations: TranslationStrings = {}
	const typeToMatch =
		lang !== Php ? 'call_expression' : 'function_call_expression'

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
		if (node.type === typeToMatch) {
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
					reference: `${filename}:${node.startPosition.row + 1}`,
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
				node
					.closest(['expression_statement', 'comment'])
					?.children.forEach((comment) => {
						// todo: regex to match insensitive "translators" and ":"
						if (
							comment.type === 'comment' &&
							comment.text.toLowerCase().includes('translators:')
						)
							(gettext.comments as GetTextComment).translator =
								stripTranslationMarkup(comment.text)
					})
			}

			gettextTranslations[gettext.msgctxt ?? ''] = {
				...(gettextTranslations[gettext.msgctxt ?? ''] || {}),
				[gettext.msgid]: gettext,
			}
		}
	}

	traverse(node)

	// Return both matches and entries
	return gettextTranslations
}
