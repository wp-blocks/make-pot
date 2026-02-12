import fs from "node:fs";
import { cpus, totalmem } from "node:os";
import path from "node:path";
import { modulePath } from "../const.js";
import type { Patterns } from "../types.js";

/**
 * A function that removes comment markup from a given string.
 *
 * @param {string} input - The input string with comment markup.
 * @return {string} - The input string without comment markup.
 */
export function getCommentBlock(input: string): string {
	const commentBlock = input.match(/\/\*\*?[\s\S]*?\*\//);
	return commentBlock !== null ? commentBlock[0] : input;
}

/**
 * A function that starts to capture the text after the first letter.
 *
 * @param {string} input - The input string with comment markup.
 * @return {string} - The input string without comment markup.
 */
export function removeCommentMarkup(input: string): string[] | null {
	return input.match(/[a-zA-Z].*/gm);
}

/**
 * Removes the markup from a comment string.
 *
 * @param {string} comment - The comment string to remove markup from.
 * @return {string} The comment text without the markers.
 */
export function stripTranslationMarkup(comment: string): string {
	const commentPattern =
		/\/\*\*?\s*(?:translators:)\s*([\s\S]*?)\s*\*\/|\/\/\s*(?:translators:)\s*(.*)$/i;
	const matches = comment.match(commentPattern);
	return matches ? matches[1] : comment;
}

/**
 * Splits a string into an array of strings based on the presence of a comma.
 *
 * @param {string} string - The string to be split.
 * @return {string[]} An array of strings after splitting the input string.
 */
export function stringstring(string: string | string[] | undefined): string[] {
	if (typeof string === "string") {
		if (string.includes(",")) {
			return string.split(",");
		}
		return [string];
	}
	return [];
}

/**
 * Determines if a pattern represents a file, a directory, or a glob pattern.
 * @param pattern - The pattern string to evaluate.
 * @returns 'file', 'directory', or 'glob'.
 */
export function detectPatternType(
	pattern: string,
): "file" | "directory" | "glob" {
	const containsFileExtension = pattern.includes(".");
	const containsDirectorySeparator = pattern.includes(path.sep);

	if (pattern.includes("*")) {
		return "glob";
	}
	if (!containsFileExtension && !containsDirectorySeparator) {
		return "directory";
	}
	if (containsFileExtension && !containsDirectorySeparator) {
		return "file";
	}
	return "glob";
}

/**
 * Gets the file extension from a filename.
 * @param filename - The name of the file to extract the extension from.
 * @returns The file extension, or 'blade.php' for Blade templates.
 */
export function getFileExtension(filename: string): string {
	if (filename.endsWith(".blade.php")) {
		return "blade.php";
	}
	return filename.split(".").pop() || "";
}

/**
 * Generates a copyright comment for the specified slug and license.
 *
 * @param slug - The slug to include in the copyright comment
 * @param [license='GPL v2 or later'] - The license to use in the copyright comment
 * @return The generated copyright comment
 */
export function getCopyright(
	slug: string,
	license = "GPL v2 or later",
): string {
	return (
		`# Copyright (C) ${new Date().getFullYear()} ${slug}\n` +
		`# This file is distributed under the ${license} license.`
	);
}

/**
 * Reverse slashes in a path, and replace backward slashes with forward slashes
 *
 * @param filePath - The path to be reversed.
 * @return {string} The reversed path.
 */
export function reverseSlashes(filePath: string): string {
	// Replace backward slashes with forward slashes
	return filePath.replace(/\\/g, "/");
}

/**
 *  The makepot package.json file data
 *  @arguments {string[]} fields - The fields to extract
 *  @return {Record<string, unknown>} - The package.json data
 */
export function getPkgJsonData(
	location?: string,
	...fields: string[]
): Record<string, unknown> {
	const requested: Record<string, unknown> = {};
	// read the package.json file the is in the root directory
	const pkgJsonPath = path.join(location || process.cwd(), "package.json");
	// read the package.json file or return an empty object
	const pkgJson: Record<string, unknown> = fs.existsSync(pkgJsonPath)
		? require(pkgJsonPath)
		: {};
	// extract the requested fields from the package.json
	for (const field of fields) {
		if (pkgJson[field]) {
			requested[field] = pkgJson[field];
		}
	}
	return requested;
}

/**
 * Print the module header with the current version and name
 */
export function printModuleInfo() {
	const { version, name } = getPkgJsonData(modulePath, "name", "version");
	/* print the version */
	console.log(`${name} version: ${version}`);
}

/**
 * Output to the console the time elapsed in milliseconds between two dates
 * @param scriptName the name of the script
 * @param timeStart the start time
 * @param timeEnd the end time
 */
export function printTimeElapsed(
	scriptName: "Make-Pot" | "Make-Json",
	timeStart: Date,
	timeEnd: Date = new Date(),
) {
	console.log(
		`\n🚀 ${scriptName}: Task completed! ${scriptName.split("-")[1]} file created in ${timeEnd.getTime() - timeStart.getTime()
		}ms`,
	);
}

/**
/**
* Prints the memory usage and cpu usage of the system
 */
export function printStats() {
	console.log(
		"Memory usage:",
		(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
		"MB (Free:",
		(totalmem() / 1024 / 1024 / 1024).toFixed(2),
		"GB)\nCpu User:",
		(process.cpuUsage().user / 1000000).toFixed(2),
		"ms Cpu System:",
		(process.cpuUsage().system / 1000000).toFixed(2),
		"ms of",
		cpus().length,
		"cores",
	);
}

/**
 * Returns the output path recap
 *
 * @param {string} cwd - The current working directory
 * @param {Patterns} patterns - The patterns to be used for the extraction process
 * @return {string} - The output path recap
 */
export function outputPathRecap(cwd: string, patterns: Patterns): string {
	return `\nScript Path: ${cwd}\nfor ${patterns.include.join()}\nignoring patterns: ${patterns.exclude.join()}\n`;
}
