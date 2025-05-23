const fs = require("node:fs");
const { describe, it } = require("node:test");
const assert = require("node:assert");
const { generateHeader, getAuthorFromPackage } = require("../lib");
const { join } = require("node:path");

describe("Header generation", () => {
	describe("Should generate a valid header", () => {
		it("from user full data", async () => {
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

		it("from user data", async () => {
			const expected = {};
			const author = await getAuthorFromPackage({
				authors: ["erik"],
			});

			assert.deepStrictEqual(author, {
				name: "erik",
				email: undefined,
				website: undefined,
			});
		});

		it("from package.json data", async () => {
			const expected = {
				"Project-Id-Version": "My Plugin Name 1.0.0",
				"Report-Msgid-Bugs-To": "https://wordpress.org/support/plugins/plugin",
				"MIME-Version": "1.0",
				"Content-Transfer-Encoding": "8bit",
				"content-type": "text/plain; charset=iso-8859-1",
				"plural-forms": "nplurals=2; plural=(n!=1);",
				"POT-Creation-Date": undefined, // because the date is going to change every test
				"PO-Revision-Date": undefined, // because the date is going to change every test
				"Last-Translator": "John Doe <bbb@ccc.ddd>",
				"Language-Team": "John Doe <bbb@ccc.ddd>",
				"X-Generator": undefined, // because the version changes
				Language: "en",
				"X-Domain": "plugin",
			};

			const result = await generateHeader({
				headers: {
					name: "My Plugin Name",
					author: "John Doe",
					version: "1.0.0",
					license: "MIT",
					homepage: "https://example.com",
					repository: "https://github.com/example/my-block",
					domain: "my-plugin-text-domain",
				},
				paths: {
					cwd: join(process.cwd(), "tests/fixtures/plugin"),
				},
			});

			// remove the date "POT-Creation-Date"
			result["POT-Creation-Date"] = undefined;
			result["PO-Revision-Date"] = undefined;
			result["X-Generator"] = undefined;

			assert.deepStrictEqual(result, expected);
		});
	});
});
