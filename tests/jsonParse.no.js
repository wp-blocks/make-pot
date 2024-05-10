const fs = require("node:fs");
const { describe, it } = require("node:test");
const assert = require("node:assert");
const { parseJsonFile } = require("../lib/extractors/json.js");

describe("should parse json", () => {
	it("theme.json", async () => {
		const expected = {
			"block style label": {
				label: {
					comments: {
						reference: "block/block.json",
					},
					msgctxt: "block style label",
					msgid: "label",
					msgstr: [],
				},
			},
			"block description": {
				description: {
					comments: {
						reference: "block/block.json",
					},
					msgctxt: "block description",
					msgid: "description",
					msgstr: [],
				},
			},
			"block keyword": {
				undefined: {
					comments: {
						reference: "block/block.json",
					},
					msgctxt: "block keyword",
					msgid: undefined,
					msgstr: [],
				},
			},
		};

		const result = await parseJsonFile({
			fileContent: fs.readFileSync("tests/fixtures/block/block.json", "utf8"),
			filename: "block.json",
			filepath: "block/block.json",
		});

		assert.strictEqual(result, expected);
	});
});
