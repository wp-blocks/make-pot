const fs = require("node:fs");
const { describe, it } = require("node:test");
const assert = require("node:assert");
const { join, resolve } = require("node:path");

describe("MakeJson", () => {
	describe("should return the used translations", () => {
		it("compare js translations with pot file", async () => {
			const { MakeJsonCommand } = await require("../lib");
			// the current working directory
			const path = "tests/fixtures/makejson";
			const cwd = join(process.cwd(), path);
			const makeJson = new MakeJsonCommand({
				source: "",
				destination: "",
				paths: {
					cwd: cwd,
					source: cwd,
					destination: cwd,
				},
			});

			const result = await makeJson.processFile(
				"tests/fixtures/makejson/i18n.pot",
				"tests/fixtures/makejson/script.js",
			);

			assert.deepStrictEqual(result, {
				name: "John Doe",
				email: "1dHsK@example.com",
				website: "http://example.com",
			});
		});
	});
});
