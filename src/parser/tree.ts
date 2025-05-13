import Parser, { type SyntaxNode } from "tree-sitter";
import { i18nFunctions } from "../const.js";

import { Block, SetOfBlocks } from "gettext-merger";
import { getParser } from "../fs/glob.js";
import { reverseSlashes, stripTranslationMarkup } from "../utils/common.js";

/**
 * Collect comments from the AST node and its preceding siblings.
 *
 * @param {SyntaxNode} node - The AST node.
 * @return {string[]} An array of collected comments.
 */
function collectComments(node: SyntaxNode): string | undefined {
	let currentNode = node;
	let depth = 0;

	// Check the node's preceding siblings for comments
	while (currentNode && depth < 6) {
		if (
			currentNode?.previousSibling?.type === "comment" &&
			currentNode?.previousSibling?.text.toLowerCase().includes("translators")
		) {
			return currentNode?.previousSibling?.text
				? stripTranslationMarkup(currentNode.previousSibling.text)
				: undefined;
		}
		depth++;
		currentNode = currentNode.parent as SyntaxNode;
	}
}

/**
 * Parses the source code using the specified language parser and extracts the strings from the file.
 *
 * @param {string} sourceCode - The source code to be parsed.
 * @param {string} filepath - The path to the file being parsed.
 * @return {SetOfBlocks} An array of translation strings.
 */
export function doTree(sourceCode: string, filepath: string): SetOfBlocks {
	// set up the parser
	const parser = new Parser();
	const parserExt = getParser(filepath);
	// if no parser is found return empty
	if (!parserExt) return new SetOfBlocks([], filepath);
	// set the parser language
	parser.setLanguage(parserExt);

	// parse the file
	const tree = parser.parse(sourceCode);

	// set up the translation object
	const gettextTranslations: SetOfBlocks = new SetOfBlocks([], filepath);

	const typeToMatch =
		filepath.split(".").pop()?.toLowerCase() !== "php"
			? "call_expression"
			: "function_call_expression";

	const stringType = [
		"string",
		"string_value",
		"variable_name",
		"member_expression",
		"subscript_expression",
		"function_call_expression",
		"encapsed_string",
	];

	/**
	 * Traverse the tree 🌳
	 *
	 * @param {SyntaxNode} node The node to traverse through
	 */
	function traverse(node: SyntaxNode): void {
		// Walk the tree
		if (node?.children.length)
			for (const child of node.children) {
				traverse(child);
			}

		// Check if the node matches
		if (node?.type === typeToMatch) {
			// The function name is the first child
			const functionName = node.firstChild?.text ?? null;
			if (
				functionName === null ||
				!Object.keys(i18nFunctions).includes(functionName)
			) {
				return;
			}

			// The arguments are the last child
			const argsNode = node.lastChild;
			if (
				argsNode === null ||
				argsNode.childCount === 0 ||
				argsNode.type !== "arguments"
			) {
				return;
			}

			// Get the whole gettext translation string
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const [_fn, raw] = node.children;
			const translation: Partial<{
				msgctxt: string;
				msgid: string;
				msgid_plural: string;
				msgstr: string;
			}> = {};

			const translationKeys =
				i18nFunctions[functionName as keyof typeof i18nFunctions];

			const children = raw.children.slice(1, -1);
			let translationKeyIndex = 0;

			// Get the translation from the arguments (the quoted strings)
			for (const child of children) {
				let node = child;
				let nodeValue: string | string[] = node.text;

				// unwrap the argument node, which is used in PHP.
				if (child.type === "argument") {
					if (child.children.length === 0) continue;
					node = child.children[0];
				}

				if (node?.type === ",") {
					// skip the comma between arguments
					continue;
				}

				if (node?.type && stringType.includes(node.type)) {
					// unquote the strings
					nodeValue = nodeValue.slice(1, -1);
				} else {
					// unexpected node type this string is not translatable and should be skipped
					console.warn(
						`Unexpected node type: ${node?.type} is ${translationKeys[translationKeyIndex]} for  ${nodeValue} in ${filepath}`,
					);
					continue;
				}

				// the translation key (eg. msgid)
				const currentKey = translationKeys[
					translationKeyIndex
				] as keyof typeof translation;

				// the value of that key
				translation[currentKey] = nodeValue;

				// increment the index of the translation key
				translationKeyIndex += 1;
			}

			// TODO: Alert about wrong translation domain?
			const comments = collectComments(argsNode);

			// Get the translation data
			const block = new Block({
				msgctxt: translation.msgctxt,
				msgid: translation.msgid ?? "",
				msgid_plural: translation.msgid_plural,
				msgstr: translation.msgid_plural ? ["", ""] : [""],
				comments: {
					translator: comments ? [comments] : undefined,
					reference: [
						`${reverseSlashes(filepath)}:${node.startPosition.row + 1}`,
					],
				},
			} as Block);

			gettextTranslations.add(block);
		}
	}

	traverse(tree.rootNode);

	// Return both matches and entries
	return gettextTranslations;
}
