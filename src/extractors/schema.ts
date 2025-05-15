import * as blocki18n from "../assets/block-i18n.js";
import type BlockI18n from "../assets/block-i18n.js";
import * as themei18n from "../assets/theme-i18n.js";
import type ThemeI18n from "../assets/theme-i18n.js";
import type { I18nSchema } from "../types.js";

/**
 * Extracts strings from JSON files using the I18n schema.
 */

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
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
	 * @param {string} url - The URL to load the schema from.
	 * @param {I18nSchema} fallback - The fallback schema to use if the main URL fails.
	 * @return {Promise<I18nSchema>} The loaded schema.
	 */
	private static async loadSchema(
		url: string,
		fallback: I18nSchema,
	): Promise<I18nSchema> {
		if (JsonSchemaExtractor.schemaCache[url]) {
			return JsonSchemaExtractor.schemaCache[url];
		}

		try {
			console.log(`\n[i] Loading schema from ${url}`);
			const response = await fetch(url, {
				responseType: "json",
				accept: "application/json",
				headers: {
					"Access-Control-Allow-Origin": "*",
				},
			})
				.then((response) => response.json())
				.catch((error: Error) => {
					throw new Error(
						`\nFailed to load schema from ${url}. Error: ${error.message}`,
					);
				});

			// Verify if the response is valid
			if (!response) {
				return fallback;
			}

			console.log("Schema loaded successfully");
			JsonSchemaExtractor.schemaCache[url] = response;
			return response;
		} catch (error) {
			console.error(
				`\nFailed to load schema from ${url}. Using fallback. Error: ${error.message}`,
			);
			JsonSchemaExtractor.schemaCache[url] = fallback;
			return fallback;
		}
	}

	/**
	 * Parses a string and extracts translations using the specified schema.
	 *
	 * @param {string} text - the input string to be parsed
	 * @param {{ [key: string]: any }} options - the options for parsing the input string
	 * @return {Promise<I18nSchema | undefined>} a promise that resolves with the extracted schema
	 */
	public static async fromString(
		text: string,
		options: { schema?: string; schemaFallback?: I18nSchema },
	): Promise<I18nSchema | undefined> {
		const schemaUrl = options.schema as string;
		const schemaFallback = options.schemaFallback as I18nSchema;

		if (!schemaUrl || !schemaFallback) {
			console.error("Schema URL or fallback not provided");
			return;
		}

		const schema = await JsonSchemaExtractor.loadSchema(
			schemaUrl,
			schemaFallback,
		);

		try {
			const json = JSON.parse(text) as Record<string, unknown>;
			if (json === null) {
				console.error("Could not parse JSON.");
				return;
			}

			return JsonSchemaExtractor.extractStringsUsingI18nSchema(schema, json);
		} catch (error) {
			console.error(`Error parsing JSON: ${error.message}`);
			return;
		}
	}

	/**
	 * Extracts strings using the provided I18n schema and settings.
	 *
	 * @param {I18nSchema} i18nSchema - The I18n schema to extract strings from.
	 * @param {any} json - The settings to use for string extraction.
	 * @return {{ [key: string]: string }} The extracted translations as key-value pairs.
	 */
	private static extractStringsUsingI18nSchema(
		i18nSchema: I18nSchema,
		json: Record<string, unknown>,
	): I18nSchema | undefined {
		if (!i18nSchema || !json) {
			return {};
		}

		/**
		 * the rest of the schema are nested in an object
		 */
		if (typeof i18nSchema === "object" && typeof json === "object") {
			const groupKey = "*";
			const result: I18nSchema = {};
			for (const [key, value] of Object.entries(json)) {
				if (
					i18nSchema[key] &&
					(typeof value === "string" || Array.isArray(value))
				) {
					result[key] = value;
				} else if (Object.prototype.hasOwnProperty.call(i18nSchema, groupKey)) {
					const extracted = JsonSchemaExtractor.extractStringsUsingI18nSchema(
						i18nSchema[groupKey] as I18nSchema,
						value as Record<string, unknown>,
					);
					if (extracted) {
						Object.assign(result, extracted);
					}
				}
			}
			return result;
		}

		return json as I18nSchema;
	}
}
