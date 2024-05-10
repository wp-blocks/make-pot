const fs = require("node:fs");
const path = require("node:path");
const { describe, it } = require("node:test");
const assert = require("node:assert");

const { makePot } = require("../lib/");
const { getArgs } = require("../lib/cli/getArgs.js");

describe("doTree is like wpcli", () => {
	it("Should emit a pot file for theme like the wp-cli makepot", async () => {
		const filePath = path.join(process.cwd(), "./tests/fixtures/theme/");
		const potPath = path.join(process.cwd(), "./tests/fixtures/theme.pot");
		const potContent = fs.readFileSync(potPath, "utf8");
		const args = getArgs({
			_: [filePath],
		});
		const fileParsed = await makePot(args);
		assert.deepEqual(fileParsed, potContent);
	});

	it("should emit a pot file for plugin like the wp-cli makepot", async () => {
		const filePath = path.join(process.cwd(), "./tests/fixtures/vinyl/");
		const potPath = path.join(process.cwd(), "./tests/fixtures/vinyl.pot");
		const potContent = fs.readFileSync(potPath, "utf8");

		const args = getArgs({
			_: [filePath],
		});
		const fileParsed = await makePot(args);
		assert.deepEqual(fileParsed, potContent);
	});
});
