import Parser, { type SyntaxNode } from 'tree-sitter'
import { type TranslationString } from './types'
import { i18nFunctions } from './const'

// @ts-expect-error
import Php from 'tree-sitter-php'
import { stripTranslationMarkup } from './utils'

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
): TranslationString[] {
	const matches: TranslationString[] = []
	const typeToMatch = lang !== Php ? 'call_expression' : 'function_call_expression'

	/**
	 * Traverse the tree 🌳
	 *
	 * @param {SyntaxNode} node The node to traverse through
	 */
	function traverse(node: SyntaxNode): void {
		for (const child of node.children) {
			traverse(child)
		}
		if (node.type === typeToMatch) {
			// The function name is the first child
			const functionName = node.firstChild?.text ?? null
			if (functionName === null || !Object.keys(i18nFunctions).includes(functionName)) {
				return
			}

			// The arguments are the last child
			const argsNode = node.lastChild
			if (argsNode === null || argsNode.childCount === 0 || argsNode.type !== 'arguments') {
				return
			}

			const [fn, raw] = node.children
			const translation: string[] = []
			// Get the translation from the arguments (the quoted strings)
			raw.children.slice(1, -1).forEach((child) => {
				if (/^["|']/.exec(child.text[0])) translation.push(child.text.slice(1, -1))
			})

			let commentRaw = undefined
			node.closest('program')?.children.forEach((comment) => {
				// todo: regex to match insensitive "translators" and ":"
				if (comment.type === 'text' && comment.text.toLowerCase().includes('translators:'))
					return (commentRaw = 'translators: ' + stripTranslationMarkup(comment.text))
			})

			matches.push({
				reference: `#: ${filename}:${node.startPosition.row + 1}`,
				type: i18nFunctions[fn.text as keyof typeof i18nFunctions] ?? 'text_domain',
				raw: translation,
				msgid: translation[0],
				comments: commentRaw,
			})
		}
	}

	traverse(node)

	// Return both matches and entries
	return matches
}
