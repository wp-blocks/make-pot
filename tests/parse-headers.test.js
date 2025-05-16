const fs = require("node:fs");
const { describe, it } = require("node:test");
const assert = require("node:assert");
const { generateHeader, getAuthorFromPackage } = require("../lib");

describe("Header generation", () => {
	describe("Should generate a valid header", () => {
		it("from user data", async () => {
			const expected = {};
			const author = await getAuthorFromPackage({
				authors: ["John Doe <1dHsK@example.com> (http://example.com)"],
			});

			assert.deepStrictEqual(author, {
				name: "John Doe",
				email: "1dHsK@example.com",
				website: "http://example.com",
			});
		});

		it("from package.json data", async () => {
			const expected = {
				"Project-Id-Version": "plugin 1.5.1",
				"Report-Msgid-Bugs-To": "Erik Golinelli <erik@codekraft.it>",
				"MIME-Version": "1.0",
				"Content-Transfer-Encoding": "8bit",
				"content-type": "text/plain; charset=iso-8859-1",
				"plural-forms": "nplurals=2; plural=(n!=1);",
				"POT-Creation-Date": undefined,
				"PO-Revision-Date": undefined,
				"Last-Translator": "Erik Golinelli <erik@codekraft.it>",
				"Language-Team": "Erik Golinelli <erik@codekraft.it>",
				"X-Generator": "@wp-blocks/make-pot 1.5.1",
				Language: "en",
				"x-Domain": "plugin",
			};

			const result = await generateHeader({
				name: "my-block",
				authors: ["John Doe <1dHsK@example.com> (http://example.com)"],
				version: "1.0.0",
				license: "MIT",
				homepage: "https://example.com",
				repository: "https://github.com/example/my-block",
				domain: "my-plugin-text-domain",
				paths: {
					cwd: "./tests/fixtures/plugin",
				},
			});

			// remove the date "POT-Creation-Date"
			result["POT-Creation-Date"] = undefined;
			result["PO-Revision-Date"] = undefined;

			assert.deepStrictEqual(result, expected);
		});
	});
});
