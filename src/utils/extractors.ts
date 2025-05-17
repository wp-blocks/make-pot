import { Block, SetOfBlocks } from "gettext-merger";

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
 * Returns a gettext translation object
 *
 * @param label the label of the translation
 * @param string the string of the translation
 * @param filePath the file path of the translation
 */
export const buildBlock = (
	label: string,
	string: string,
	filePath: string[] | undefined = undefined,
): Block => {
	const block = new Block([]);
	block.msgctxt = undefined;
	block.msgid = string;
	block.msgid_plural = "";
	block.msgstr = [];
	block.comments = {};
	if (label) {
		block.comments.extracted = [label];
	}
	if (filePath?.length) {
		block.comments.reference = filePath;
	}
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
	parsed: Block[],
	filename: "block.json" | "theme.json",
	filepath: string,
): SetOfBlocks {
	const gettextTranslations: SetOfBlocks = new SetOfBlocks([], filepath);

	if (parsed.length === 0) {
		return gettextTranslations;
	}

	// set the path of the translation
	gettextTranslations.path = filepath;

	for (const item of parsed) {
		const block = buildBlock(
			item.msgid,
			item.msgctxt as string,
			item.comments?.reference,
		);

		if (block) {
			gettextTranslations.blocks.push(block);
		}
	}

	return gettextTranslations;
}
