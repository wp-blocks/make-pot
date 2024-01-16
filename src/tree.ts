import Parser, { type SyntaxNode } from 'tree-sitter'
import { type TranslationString } from './types'
import { i18nFunctions } from './const'

// @ts-expect-error
import Php from 'tree-sitter-php'
import { removeCommentMarkup } from './utils'

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
			const functionNameNode = node.firstChild
			const functionName = functionNameNode?.text ?? null

			if (functionName === null || !Object.keys(i18nFunctions).includes(functionName)) {
				return
			}

			const argsNode = node.lastChild

			if (argsNode === null || argsNode.childCount === 0) {
				return
			}

			const [fn, raw] = node.children
			const translation: string[] = []
			raw.children.slice(1, -1).forEach((child) => {
				console.log(child.type, child.text)
				// if isn't starting with a quote or a double quote
				if (child.text[0] === '"' || child.text[0] === "'")
					translation.push(child.text.slice(1, -1))
			})

			let comments = ''
			let current = node

			// Search for comments in current node's previous siblings and ancestors
			searchLoop: while (current) {
				let previousNode = current.previousSibling

				while (previousNode) {
					if (previousNode.type === 'comment') {
						const commentText = previousNode.text.trim()
						if (commentText.includes('translators:')) {
							comments = commentText
							break searchLoop
						}
					}
					previousNode = previousNode.previousSibling
				}

				// Move to the parent node to check its siblings
				current = current.parent as SyntaxNode
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
	}

	traverse(node)

	return matches
}
