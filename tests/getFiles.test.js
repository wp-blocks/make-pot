const path = require("node:path");
const { describe, it } = require("node:test");
const assert = require("node:assert");
const { parseCliArgs } = require("../lib/cli/parseCli.js");
const { getFiles } = require("../lib/fs/glob.js");

describe("getFiles", () => {
	const DEFAULTS = parseCliArgs({
		domain: "plugin",
		slug: "plugin-slug",
		paths: { cwd: "tests/fixtures/", out: "tests/fixtures/" },
		options: {
			silent: true,
		},
		$0: "makepot",
		_: [0, 1],
	});

	it("should retrieve a all files", async () => {
		const args = { ...DEFAULTS, domain: "theme" };
		const pattern = { include: ["./src/**"], exclude: [] };

		const files = getFiles(args, pattern);
		const collected = [];
		for (const file of files) {
			assert.equal(!!file, true);
			collected.push(file);
		}
		assert.deepStrictEqual(collected.length, 28);
		assert.strictEqual(
			collected.find((e) => e.includes("const.ts")),
			"src\\const.ts",
		);
	});

	it("Should retrieve a list of txt files based on the provided plugin pattern", async () => {
		const args = {
			...DEFAULTS,
		};
		const pattern = {
			include: ["**/*.txt"],
			exclude: ["node_modules", "dist"],
		};
		const expectedFiles = [
			"tests" + path.sep + "fixtures" + path.sep + "file1.txt",
			"tests" +
				path.sep +
				"fixtures" +
				path.sep +
				"sourcedir" +
				path.sep +
				"file2.txt",
			"tests" +
				path.sep +
				"fixtures" +
				path.sep +
				"block" +
				path.sep +
				"readme.txt",
		];

		const files = getFiles(args, pattern);
		const collected = [];
		for (const file of files) {
			assert.equal(!!file, true);
			collected.push(file);
		}

		assert.deepStrictEqual(collected, expectedFiles);
	});

	it("should retrieve a list of theme.json files based on the provided theme pattern", async () => {
		const args = {
			...DEFAULTS,
		};
		const pattern = {
			include: ["tests/fixtures/sourcedir/**/*.json"],
			exclude: [],
		};
		const expectedFiles = [
			`tests${path.sep}fixtures${path.sep}sourcedir${path.sep}theme.json`,
			`tests${path.sep}fixtures${path.sep}sourcedir${path.sep}package.json`,
			`tests${path.sep}fixtures${path.sep}sourcedir${path.sep}node_modules${path.sep}module${path.sep}block.json`,
		];

		const files = getFiles(args, pattern);
		const collected = [];
		for (const file of files) {
			assert.equal(!!file, true);
			collected.push(file);
		}

		const fileFound = collected.filter((file) => expectedFiles.includes(file));

		assert.deepStrictEqual(fileFound.length, 3);
	});
});
