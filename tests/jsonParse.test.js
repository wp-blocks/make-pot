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
			const expected = [
				{
					msgctxt: "Font size name",
					msgid: "Extra small",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgctxt: "Font size name",
					msgid: "Small",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgctxt: "Font size name",
					msgid: "Medium",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgctxt: "Font size name",
					msgid: "Large",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgctxt: "Font size name",
					msgid: "Extra large",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgctxt: "Font family name",
					msgid: "System Fonts",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgctxt: "Color name",
					msgid: "Base",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgctxt: "Color name",
					msgid: "Contrast",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgctxt: "Color name",
					msgid: "Accent",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgctxt: "Color name",
					msgid: "Accent Two",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgctxt: "Color name",
					msgid: "Accent Three",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgctxt: "Gradient name",
					msgid: "Accent Two to Contrast",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgctxt: "Template part name",
					msgid: "Header",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgctxt: "Template part name",
					msgid: "Footer",
					comments: {
						reference: ["block.json"],
					},
				},
			];

			const result = await parseJsonFile({
				fileContent: fs.readFileSync("tests/fixtures/fse/theme.json", "utf8"),
				filename: "theme.json",
			});

			assert.deepStrictEqual(result, expected);
		});
	});
});
