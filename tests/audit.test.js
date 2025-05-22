const { describe, it, beforeEach, before } = require("node:test");
const assert = require("node:assert");
const { StringAuditor } = require("../lib");

describe("Audit", () => {
	it("should not find any errors", () => {
		/** @type {Block[]} */
		const translations = [
			{
				comments: {
					reference: ["tests/fixtures/block/javascript.js:7"],
					translator: undefined,
				},
				msgctxt: undefined,
				msgid: "Simple Block",
				msgid_plural: undefined,
				msgstr: [""],
			},
		];

		const SA = new StringAuditor("plugin");
		SA.auditStrings(translations);

		assert.deepStrictEqual(SA.results, []);
	});

	it("should find an error", () => {
		/** @type {Block[]} */
		const translations = [
			{
				comments: {
					reference: ["tests/fixtures/block/javascript.js:7"],
					translator: undefined,
				},
				msgctxt: undefined,
				msgid: "translation with multiple %s %S %s %s %d and no comments",
				msgid_plural: undefined,
				msgstr: [""],
			},
		];

		const SA = new StringAuditor("plugin");
		SA.auditStrings(translations);

		assert.deepStrictEqual(SA.results, [
			'The string "translation with multiple %s %S %s %s %d and no comments" contains placeholders but has no "translators:" comment to clarify their meaning. (tests/fixtures/block/javascript.js:7)',
			"Multiple placeholders should be ordered. (tests/fixtures/block/javascript.js:7)",
		]);
	});
});
