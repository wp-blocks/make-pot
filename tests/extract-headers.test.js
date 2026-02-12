const { describe, it } = require("node:test");
const { join } = require("node:path");
const assert = require("node:assert");
const { extractMainFileData, getAuthorFromPackage } = require("../lib");

describe("should parse plugin main file", () => {
	describe("should parse plugin.php", () => {
		it("correctly extracts plugin headers", async () => {
			const fileParsed = extractMainFileData({
				domain: "plugin",
				paths: {
					cwd: join(process.cwd(), "tests/fixtures/plugin"),
				},
				slug: "plugin",
			});
			assert.deepStrictEqual(fileParsed, {
				author: "Erik yo",
				authorUri: "https://codekraft.it",
				description:
					"An example plugin to demo how to do internationalization in a WordPress plugin.",
				domainPath: "/languages",
				license: "GPL3+",
				licenseUri: "http://www.gnu.org/licenses/gpl-3.0.html",
				name: "plugin",
				textDomain: "i18n-example",
				version: "1.0.0",
			});
		});
	});
});

describe("should parse theme main file", () => {
	describe("should parse style.css", () => {
		it("correctly extracts theme headers", async () => {
			const fileParsed = extractMainFileData({
				domain: "theme",
				paths: {
					cwd: join(process.cwd(), "tests/fixtures/theme"),
				},
				slug: "fabled-sunset",
			});
			assert.deepStrictEqual(fileParsed, {
				name: "Theme name",
				description: "Custom theme description...",
				version: "1.0.0",
				author: "Author Name",
				tags: "block-patterns, full-site-editing",
				textDomain: "fabled-sunset",
				domainPath: "/assets/lang",
				license: "GNU General Public License v2.0 or later",
			});
		});
	});
});

describe("getAuthorFromPackage", () => {
	it("extracts author from string with name and email", () => {
		const pkgJson = {
			author: "My Name <myname@example.com>",
		};
		const author = getAuthorFromPackage(pkgJson);
		assert.deepStrictEqual(author, {
			name: "My Name",
			email: "myname@example.com",
			website: undefined,
		});
	});

	it("extracts author from string with specific user format", () => {
		const pkgJson = {
			author: "my name <myname@asdasdasdasd.it>",
		};
		const author = getAuthorFromPackage(pkgJson);
		assert.deepStrictEqual(author, {
			name: "my name",
			email: "myname@asdasdasdasd.it",
			website: undefined,
		});
	});

	it("extracts author from string with name, email and url", () => {
		const pkgJson = {
			author: "My Name <myname@example.com> (https://example.com)",
		};
		const author = getAuthorFromPackage(pkgJson);
		assert.deepStrictEqual(author, {
			name: "My Name",
			email: "myname@example.com",
			website: "https://example.com",
		});
	});

	it("extracts author from object", () => {
		const pkgJson = {
			author: {
				name: "Object Author",
				email: "obj@example.com",
				website: "https://obj.example.com"
			}
		};
		const author = getAuthorFromPackage(pkgJson);
		assert.deepStrictEqual(author, {
			name: "Object Author",
			email: "obj@example.com",
			website: "https://obj.example.com",
		});
	});

	it("extracts author from array of strings", () => {
		const pkgJson = {
			authors: [
				"Array Author <array@example.com>"
			]
		};
		const author = getAuthorFromPackage(pkgJson);
		assert.deepStrictEqual(author, {
			name: "Array Author",
			email: "array@example.com",
			website: undefined
		});
	});
});
