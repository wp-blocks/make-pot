import { Block, SetOfBlocks } from "gettext-merger";
import { getJsonComment } from "./json.js";

/**
 * Returns the key of an object based on its value
 *
 * @param object the object that contains the key
 * @param value the key that we want to get
 * @return {Record<string, string>} the filtered keys
 */
export function getKeyByValue(
	object: Record<string, unknown>,
	value: string,
): string | undefined {
	return Object.keys(object).find((key) => object[key] === value) ?? undefined;
}

/**
 * returns a gettext translation object
 *
 * @param label the label of the translation
 * @param string the string of the translation
 * @param filePath the file path of the translation
 */
export const gentranslation = (
	label: string,
	string: string,
	filePath: string,
): Block => {
	const block = new Block([]);
	block.msgctxt = undefined;
	block.msgid = string;
	block.msgid_plural = "";
	block.msgstr = [];
	block.comments = {
		extracted: [label],
		reference: [filePath],
	};
	return block;
};

/**
 * Extracts strings from parsed JSON data.
 *
 * @param {Record<string, any> | Parser.SyntaxNode} parsed - The parsed JSON data or syntax node.
 * @param {string | Parser} filename - The filename or parser.
 * @param filepath - the path to the file being parsed
 * @return {SetOfBlocks} An array of translation strings.
 */
export function yieldParsedData(
	parsed: Record<string, string | string[]>,
	filename: "block.json" | "theme.json" | "readme.txt",
	filepath: string,
): SetOfBlocks {
	const gettextTranslations: SetOfBlocks = new SetOfBlocks([], filepath);

	if (!parsed) {
		return gettextTranslations;
	}

	// set the path of the translation
	gettextTranslations.path = filepath;

	for (const [term, item] of Object.entries(parsed)) {
		/**
		 * Stores a translation in the gettextTranslations object
		 *
		 * @param value The translation string to store
		 * @param valueKey The key of the translation
		 */
		function storeTranslation(value: string, valueKey: string = term) {
			const block = gentranslation(
				getJsonComment(term, filename),
				valueKey,
				filepath,
			);

			gettextTranslations.add(block);
		}

		if (!item) {
			continue;
		}

		if (typeof item === "string") {
			storeTranslation(item);
		} else if (Array.isArray(item)) {
			for (const value of item) {
				storeTranslation(value);
			}
		} else {
			for (const [key, value] of Object.entries(item)) {
				if (typeof value === "string") {
					storeTranslation(value, key);
				}
			}
		}
	}

	return gettextTranslations;
}
