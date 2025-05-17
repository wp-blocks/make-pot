const fs = require("node:fs");
const { describe, it } = require("node:test");
const assert = require("node:assert");
const { parseJsonFile } = require("../lib");

describe("should parse json", () => {
	describe("should parse block.json", () => {
		it("block.json", async () => {
			const expected = [
				{
					msgid: "block title",
					msgctxt: "my block title",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgid: "block description",
					msgctxt: "my block description",
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
					msgid: "Font size name",
					msgctxt: "Extra small",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgid: "Font size name",
					msgctxt: "Small",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgid: "Font size name",
					msgctxt: "Medium",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgid: "Font size name",
					msgctxt: "Large",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgid: "Font size name",
					msgctxt: "Extra large",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgid: "Font family name",
					msgctxt: "System Fonts",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgid: "Color name",
					msgctxt: "Base",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgid: "Color name",
					msgctxt: "Contrast",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgid: "Color name",
					msgctxt: "Accent",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgid: "Color name",
					msgctxt: "Accent Two",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgid: "Color name",
					msgctxt: "Accent Three",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgid: "Gradient name",
					msgctxt: "Accent Two to Contrast",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgid: "Template part name",
					msgctxt: "Header",
					comments: {
						reference: ["block.json"],
					},
				},
				{
					msgid: "Template part name",
					msgctxt: "Footer",
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
