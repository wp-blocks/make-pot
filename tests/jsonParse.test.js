const fs = require("node:fs");
const { describe, it } = require("node:test");
const assert = require("node:assert");
const { parseJsonFile } = require("../lib");

describe("should parse json", () => {
	describe("should parse block.json", () => {
		it("block.json", async () => {
			const expected = [
				{
					msgid: "my block title",
					msgctxt: "block title",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgid: "my block description",
					msgctxt: "block description",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgid: "block keyword",
					msgctxt: "my block keyword",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgid: "block keyword",
					msgctxt: "my block keyword 2",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgid: "block keyword",
					msgctxt: "my block keyword 3",
					comments: {
						reference: ["block.json"],
					},
				},
			];

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
					msgid: "Extra small",
					msgctxt: "Font size name",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgid: "Small",
					msgctxt: "Font size name",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgid: "Medium",
					msgctxt: "Font size name",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgid: "Large",
					msgctxt: "Font size name",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgid: "Extra large",
					msgctxt: "Font size name",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgid: "System Fonts",
					msgctxt: "Font family name",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgid: "Base",
					msgctxt: "Color name",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgid: "Contrast",
					msgctxt: "Color name",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgid: "Accent",
					msgctxt: "Color name",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgid: "Accent Two",
					msgctxt: "Color name",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgid: "Accent Three",
					msgctxt: "Color name",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgid: "Accent Two to Contrast",
					msgctxt: "Gradient name",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgid: "Header",
					msgctxt: "Template part name",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgid: "Footer",
					msgctxt: "Template part name",
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
