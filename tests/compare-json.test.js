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
				stripUnused: true,
			});

			const result = await makeJson.processFile(
				"tests/fixtures/makejson/live-search-block-it_IT.po",
				"tests/fixtures/makejson/script.js",
			);

			result["translation-revision-date"] = undefined;

			assert.deepStrictEqual(result.locale_data.messages, {
				"": {
					domain: "messages",
					lang: "it_IT",
					plural_forms: "nplurals=2; plural=(n != 1);",
				},
				Search: ["Cerca"],
				"Type to search…": ["Digita per cercare…"],
				"Please add %s more characters": [
					"Aggiungere %s altri caratteri",
					"Aggiungere %s caratteri in più",
				],
				"Sorry, no results found": ["Spiacente, nessun risultato trovato"],
			});
		});

		it("compare js translations with pot file", async () => {
			const { MakeJsonCommand } = await require("../lib");
			// the current working directory
			const path = "tests/fixtures/makejson-2";
			const cwd = join(process.cwd(), path);
			const makeJson = new MakeJsonCommand({
				source: "",
				destination: "",
				paths: {
					cwd: cwd,
					source: cwd,
					destination: cwd,
				},
				stripUnused: true,
			});

			const result = await makeJson.processFile(
				"tests/fixtures/makejson-2/plugin2-it_IT.po",
				"tests/fixtures/makejson-2/unminified.js",
			);

			result["translation-revision-date"] = undefined;

			assert.deepStrictEqual(result.locale_data.messages, {
				"": {
					domain: "messages",
					lang: "it_IT",
					plural_forms: "nplurals=2; plural=(n != 1);",
				},
				"Grid view": ["Vista a griglia"],
				"List view": ["Visualizzazione elenco"],
			});
		});
	});
});
