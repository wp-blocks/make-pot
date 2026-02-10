import Parser, { type SyntaxNode } from "tree-sitter";
import { i18nFunctions } from "../const.js";

import { Block, SetOfBlocks } from "gettext-merger";
import { getParser } from "../fs/glob.js";
import { reverseSlashes, stripTranslationMarkup } from "../utils/common.js";
import type { Args } from "../types.js";

/**
 * Collect comments from the AST node and its preceding siblings.
 *
 * @param {SyntaxNode} node - The AST node.
 * @return {string | undefined} The collected comment or undefined.
 */
function collectComments(node: SyntaxNode): string | undefined {
	let currentNode: SyntaxNode | null = node;
	let depth = 0;

	// Check the node's preceding siblings for comments
	while (currentNode && depth < 6) {
		if (
			currentNode.previousSibling?.type === "comment" &&
			currentNode.previousSibling.text.toLowerCase().includes("translators")
		) {
			return stripTranslationMarkup(currentNode.previousSibling.text);
		}
		depth++;
		currentNode = currentNode.parent;
	}
	return undefined;
}

/**
 * Resolves the actual string value from a tree-sitter node,
 * handling escape sequences in double-quoted strings.
 *
 * @param {SyntaxNode} node - The AST node.
 * @return {string} The collected comment or undefined.
 */
function resolveStringValue(node: SyntaxNode): string {
	// Handle double-quoted strings (PHP encapsed_string)
	if (node.type === 'encapsed_string') {
		return node.children
			.map((child) => {
				if (child.type === 'escape_sequence') {
					// Unescape common sequences
					switch (child.text) {
						case '\\n': return '\n';
						case '\\r': return '\r';
						case '\\t': return '\t';
						case '\\\\': return '\\';
						case '\\"': return '"';
						case '\\$': return '$';
						case '\\e': return '\x1b';
						case '\\f': return '\f';
						case '\\v': return '\v';
						default: return child.text;
					}
				}
				// Return literal content
				if (child.type === 'string_content') {
					return child.text;
				}
				// Handle variables if they appear (preserve them as text)
				if (child.type === 'variable_name') {
					return child.text;
				}
				return '';
			})
			.join('');
	}

	// Handle single-quoted strings (PHP string) or JS strings
	if (node.type === 'string') {
		const text = node.text;
		// Strip surrounding quotes if present
		if ((text.startsWith("'") && text.endsWith("'")) ||
			(text.startsWith('"') && text.endsWith('"'))) {
			// Remove quotes and unescape escaped quotes
			return text.slice(1, -1).replace(/\\'/g, "'").replace(/\\\\/g, "\\");
		}
	}

	// Fallback for other node types (identifiers, etc.)
	return node.text;
}

/**
 * Parses the source code using the specified language parser and extracts the strings from the file.
 *
 * @param {string} sourceCode - The source code to be parsed.
 * @param {string} filepath - The path to the file being parsed.
 * @param {boolean} debugEnabled - Whether debug mode is enabled.
 * @param {Args} args - The command line arguments, optional.
 * @return {SetOfBlocks} An array of translation strings.
 */
export function doTree(
	sourceCode: string,
	filepath: string,
	debugEnabled?: boolean,
	args?: Args,
): SetOfBlocks {
	// set up the parser
	const parser = new Parser();
	const parserExt = getParser(filepath);
	// if no parser is found return empty
	if (!parserExt) return new SetOfBlocks([], filepath);
	// set the parser language
	parser.setLanguage(parserExt);

	// set up the translation object
	const gettextTranslations: SetOfBlocks = new SetOfBlocks([], filepath);

	const typeToMatch =
		filepath.split(".").pop()?.toLowerCase() !== "php"
			? "call_expression"
			: "function_call_expression";

	const stringType = [
		"name",
		"string",
		"string_value",
		"variable_name",
		"binary_expression",
		"member_expression",
		"subscript_expression",
		"shell_command_expression",
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
				number: string;
				msgstr: string;
				text_domain: string;
			}> = {
				// WordPress default text domain is 'default'
				text_domain: 'default',
			};

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

				// the translation key (eg. msgid)
				const currentKey = translationKeys[
					translationKeyIndex
				] as keyof typeof translation;

				// Resolve the value using our new function (handles quotes and escapes)
				let nodeValue: string = resolveStringValue(node);

				if (node?.type && stringType.includes(node.type)) {
					// unquote the strings
					nodeValue = nodeValue.slice(1, -1);
				} else if (currentKey === 'number'){
					// `number` accepts any value, this will not be provided in the POT file
					nodeValue = node.text;
				} else {
					// Whenever we get an unexpected node type this string is not translatable and should be skipped
					console.error(
						`Unexpected node type ${node?.type} identified as ${translationKeys[translationKeyIndex]} with value ${nodeValue} in ${filepath} at ${node.startPosition.row + 1} pos ${node.startPosition.column + 1}`,
					);
					return;  // Parse error, skip this translation.
				}

				// the value of that key
				translation[currentKey] = nodeValue;

				// increment the index of the translation key
				translationKeyIndex += 1;
			}

			if (Array.isArray(args?.options?.translationDomains) && !args.options.translationDomains.includes(translation.text_domain as string)) {
				return;
			}

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

	try {
		if (sourceCode) {
			const fileSize = Buffer.byteLength(sourceCode, "utf8");
			let bufferSize = 1024 * 32; // 32 KB default buffer size

			if (fileSize >= bufferSize) {
				bufferSize = fileSize + 32; // dynamic buffer size with 32 bytes of padding
			}

			if (fileSize >= 1024 * 1024 * 2) {
				console.warn(`File size warning: ${filepath} exceeds 2 MB.`);
			}

			// parse the file
			const tree = parser.parse(sourceCode, undefined, { bufferSize });
			if (tree) {
				traverse(tree.rootNode);
			}
		}
	} catch (e) {
		console.error(`Failed to parse ${filepath}: ${e}`);
	}

	// Return both matches and entries
	return gettextTranslations;
}
