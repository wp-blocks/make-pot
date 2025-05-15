const fs = require("node:fs");
const { describe, it } = require("node:test");
const assert = require("node:assert");
const { parseJsonFile } = require("../lib/extractors/json.js");

describe("should parse json", () => {
	describe("should parse block.json", () => {
		it("block.json", async () => {
			const expected = {
				description: "my block description",
				keywords: [
					"my block keyword",
					"my block keyword 2",
					"my block keyword 3",
				],
				title: "my block title",
			};

			const result = await parseJsonFile({
				fileContent: fs.readFileSync("tests/fixtures/block/block.json", "utf8"),
				filename: "block.json",
			});

			assert.deepStrictEqual(result, expected);
		});
	});

	describe("should parse theme.json", () => {
		it("theme.json", async () => {
			const expected = {
				settings: {
					typography: {
						fontSizes: [
							{
								name: "Font size name",
							},
						],
						fontFamilies: [
							{
								name: "Font family name",
							},
						],
					},
					color: {
						palette: [
							{
								name: "Color name",
							},
						],
						gradients: [
							{
								name: "Gradient name",
							},
						],
						duotone: [
							{
								name: "Duotone name",
							},
						],
					},
					spacing: {
						spacingSizes: [
							{
								name: "Space size name",
							},
						],
					},
					dimensions: {
						aspectRatios: [
							{
								name: "Aspect ratio name",
							},
						],
					},
					shadow: {
						presets: [
							{
								name: "Shadow name",
							},
						],
					},
					blocks: {
						"*": {
							typography: {
								fontSizes: [
									{
										name: "Font size name",
									},
								],
								fontFamilies: [
									{
										name: "Font family name",
									},
								],
							},
							color: {
								palette: [
									{
										name: "Color name",
									},
								],
								gradients: [
									{
										name: "Gradient name",
									},
								],
								duotone: [
									{
										name: "Duotone name",
									},
								],
							},
							dimensions: {
								aspectRatios: [
									{
										name: "Aspect ratio name",
									},
								],
							},
							spacing: {
								spacingSizes: [
									{
										name: "Space size name",
									},
								],
							},
						},
					},
				},
				templateParts: [
					{
						title: "Template part name",
					},
				],
			};

			const result = await parseJsonFile({
				fileContent: fs.readFileSync("tests/fixtures/fse/theme.json", "utf8"),
				filename: "theme.json",
			});

			assert.deepStrictEqual(result, expected);
		});
	});
});
