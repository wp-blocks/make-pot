import Parser, { type SyntaxNode } from 'tree-sitter'
import { type TranslationStrings } from './types'
import { i18nFunctions } from './const'

import { GetTextComment, GetTextTranslation } from 'gettext-parser'
import { getParser } from './glob'
import { stripTranslationMarkup } from './utils'

/**
 * Collect comments from the AST node and its preceding siblings.
 *
 * @param {SyntaxNode} node - The AST node.
 * @return {string[]} An array of collected comments.
 */
function collectComments(node: SyntaxNode): string | undefined {
	let currentNode = node
	let depth = 0

	// Check the node's preceding siblings for comments
	while (currentNode && depth < 6) {
		if (
			currentNode?.previousSibling?.type === 'comment' &&
			currentNode?.previousSibling?.text
				.toLowerCase()
				.includes('translators')
		) {
			return stripTranslationMarkup(currentNode?.previousSibling.text)
		}
		depth++
		currentNode = currentNode.parent as SyntaxNode
	}
}

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

			// Get the whole gettext translation string
			// const rawI18nStrnig = node.text
			const [_fn, raw] = node.children
			const translation: Partial<GetTextTranslation> = {}

			const translationKeys =
				i18nFunctions[functionName as keyof typeof i18nFunctions]

			// Get the translation from the arguments (the quoted strings)
			// Todo: parse the translations string by type of function "fn"
			raw.children.slice(1, -1).forEach((child, index) => {
				if (!child.text) return
				// the translation key (eg. msgid)
				const currentKey = translationKeys[index]
				// the value of that key
				translation[currentKey as keyof typeof translation] =
					child.text.slice(1, -1)
			})

			// Get the translation data
			const gettext: GetTextTranslation = {
				msgctxt: translation.msgctxt ?? '',
				msgid: translation.msgid ?? '',
				msgid_plural: translation.msgid_plural ?? '',
				msgstr: [], // msgstr is the translation n your language - for this pot don't need it
				comments: {
					reference: `${filepath}:${node.startPosition.row + 1}`,
					translator: collectComments(node) ?? '',
				} as GetTextComment,
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
