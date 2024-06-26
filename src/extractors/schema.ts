// block json and theme json schema extractor
import axios from "axios";
import * as blocki18n from "../assets/block-i18n.js";
import * as themei18n from "../assets/theme-i18n.js";
import type { I18nSchema } from "../types.js";

/**
 * Extracts strings from JSON files using the I18n schema.
 */
export class JsonSchemaExtractor {
	private static schemaCache: { [url: string]: I18nSchema } = {};

	/** Theme */
	static themeJsonSource =
		"http://develop.svn.wordpress.org/trunk/src/wp-includes/theme-i18n.json";
	static themeJsonFallback = themei18n;
	/** Block */
	static blockJsonSource =
		"http://develop.svn.wordpress.org/trunk/src/wp-includes/block-i18n.json";
	static blockJsonFallback = blocki18n;

	/**
	 * Load the schema from the specified URL, with a fallback URL if needed.
	 *
	 * @param {I18nSchema} url - The URL to load the schema from.
	 * @param {string} fallback - The fallback URL to use if the main URL fails.
	 * @return {Promise<I18nSchema | null>} The loaded schema, or null if loading fails.
	 */
	private static async loadSchema(
		url: string,
		fallback: I18nSchema,
	): Promise<I18nSchema> {
		if (this.schemaCache.url) {
			return this.schemaCache.url;
		}

		try {
			const response = await axios.get(url);
			this.schemaCache.url = response.data;
			return response.data;
		} catch (error) {
			console.error(`Failed to load schema from ${url}. Using fallback.`);
			const fallbackData = fallback;
			this.schemaCache.url = fallbackData;
			return fallbackData;
		}
	}

	/**
	 * Parses a string and extracts translations using the specified schema.
	 *
	 * @param {string} text - the input string to be parsed
	 * @param {{ [key: string]: any }} options - the options for parsing the input string
	 * @return {Promise<void>} a promise that resolves when the parsing is complete
	 */
	public static async fromString(
		text: string,
		options: { [key: string]: unknown },
	): Promise<I18nSchema | undefined> {
		const schema = await this.loadSchema(
			options.schema as string,
			options.schemaFallback as I18nSchema,
		);
		if (!schema) {
			console.error("Failed to load schema.");
			return;
		}

		const json = JSON.parse(text);
		if (json === null) {
			console.error(`Could not parse JSON.`);
			return;
		}

		return this.extractStringsUsingI18nSchema(schema, json);
	}

	/**
	 * Extracts strings using the provided I18n schema and settings.
	 *
	 * @param {I18nSchema} i18nSchema - The I18n schema to extract strings from.
	 * @param {any} settings - The settings to use for string extraction.
	 * @return {{ [key: string]: string }} The extracted translations as key-value pairs.
	 */
	private static extractStringsUsingI18nSchema(
		i18nSchema: I18nSchema,
		settings: unknown,
	): I18nSchema {
		if (!i18nSchema || !settings) {
			return {};
		}

		if (Array.isArray(i18nSchema) && typeof settings === "object") {
			const result: I18nSchema = {};
			for (const value in settings) {
				const extracted = this.extractStringsUsingI18nSchema(
					i18nSchema[value] as I18nSchema,
					value,
				);
				Object.assign(result, extracted);
			}
			return result;
		}

		if (typeof i18nSchema === "object" && typeof settings === "object") {
			const groupKey = "*";
			const result: I18nSchema = {};
			for (const [key, value] of Object.entries(settings)) {
				if (i18nSchema[key]) {
					result[key] = i18nSchema[key];
				} else if (Object.prototype.hasOwnProperty.call(i18nSchema, groupKey)) {
					const extracted = this.extractStringsUsingI18nSchema(
						i18nSchema[groupKey] as I18nSchema,
						value,
					);
					if (extracted) {
						Object.assign(result, extracted);
					}
				}
			}
			return result;
		}

		return {};
	}
}
