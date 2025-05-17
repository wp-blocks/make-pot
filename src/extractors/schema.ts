import type { Block } from "gettext-merger";
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
	static themeJsonFallback = themei18n as ThemeI18n;
	/** Block */
	static blockJsonSource =
		"http://develop.svn.wordpress.org/trunk/src/wp-includes/block-i18n.json";
	static blockJsonFallback = blocki18n as BlockI18n;

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
	 * @param {object} schema - the schema to use for parsing the input string
	 * @param {string} schema.url - the URL of the schema to use for parsing the input string
	 * @param {object} schema.schemaFallback - the fallback schema to use if the main schema fails
	 * @param {object} options - the options for parsing the input string
	 * @param {string} options.file - the name of the file being parsed
	 * @param {boolean} options.addReferences - whether to add references to the extracted strings
	 *
	 * @return {Promise<I18nSchema | undefined>} a promise that resolves with the extracted schema
	 */
	public static async parse(
		text: string,
		schema: {
			url: string;
			fallback: I18nSchema;
		},
		options: {
			file: "block.json" | "theme.json";
			addReferences: boolean;
		},
	): Promise<Block[] | undefined> {
		const parsedSchema = await JsonSchemaExtractor.loadSchema(
			schema.url,
			schema.fallback,
		);

		try {
			const json = JSON.parse(text) as Record<string, unknown>;
			if (!json) {
				console.error("Could not parse JSON.");
				return;
			}

			return JsonSchemaExtractor.extractFromJsonSchema(
				json,
				parsedSchema,
				options,
			);
		} catch (error) {
			console.error(`Error parsing JSON: ${error.message}`);
			return;
		}
	}

	/**
	 * Extracts translatable strings from a JSON file by comparing it with a schema
	 *
	 * @param {Object} json - The JSON object to extract strings from
	 * @param {Object} schema - The schema that defines which fields contain translatable strings
	 * @param {Object} options - Options for extraction
	 * @param {string} options.filename - The name of the file being extracted (for references)
	 * @param {boolean} options.addReferences - Whether to add file references in comments
	 * @return {Array} - An array of objects with translatable strings in gettext format
	 */
	private static extractFromJsonSchema(
		json: Record<string, unknown>,
		schema: I18nSchema,
		options: { filename?: string; addReferences?: boolean } = {
			filename: undefined,
			addReferences: false,
		},
	): Block[] | undefined {
		const { filename = "block.json", addReferences = false } = options;
		const translations = [];

		/**
		 * Recursive function to extract translatable strings
		 * @param {*} currentJson - The current node in the JSON
		 * @param {*} currentSchema - The current node in the schema
		 * @param {Array} path - The current path in the JSON
		 */
		function extract(currentJson, currentSchema, path = []) {
			// If either is null or undefined, there's nothing to do
			if (!currentJson || !currentSchema) return;

			// Handles the case where both are objects
			if (
				typeof currentJson === "object" &&
				!Array.isArray(currentJson) &&
				typeof currentSchema === "object" &&
				!Array.isArray(currentSchema)
			) {
				// Iterate over the schema keys
				for (const key of Object.keys(currentSchema)) {
					if (key in currentJson) {
						// If the key exists in the JSON, check the type
						if (typeof currentJson[key] === "string") {
							// It's a string - add it to translations
							addTranslation(
								currentJson[key],
								currentSchema[key],
								filename,
								addReferences,
							);
						} else if (
							Array.isArray(currentJson[key]) &&
							Array.isArray(currentSchema[key])
						) {
							// It's an array - handle each element
							handleArrays(
								currentJson[key],
								currentSchema[key],
								[...path, key],
								filename,
								addReferences,
							);
						} else if (
							typeof currentJson[key] === "object" &&
							typeof currentSchema[key] === "object"
						) {
							// It's an object - recurse
							extract(currentJson[key], currentSchema[key], [...path, key]);
						}
					}
				}
			}
		}

		/**
		 * Handles arrays in JSON and schema
		 * @param {Array} jsonArray - The JSON array
		 * @param {Array} schemaArray - The schema array
		 * @param {Array} path - The current path
		 * @param {string} filename - The name of the file
		 * @param {boolean} addReferences - whenever to add references
		 */
		function handleArrays(
			jsonArray,
			schemaArray,
			path,
			filename,
			addReferences,
		) {
			// If the schema has at least one element, use it as a template
			if (schemaArray.length > 0) {
				const schemaTemplate = schemaArray[0];

				// For each element in the JSON array
				for (const jsonItem of jsonArray) {
					if (typeof jsonItem === "string") {
						// If the JSON element is a string, add it directly
						addTranslation(jsonItem, schemaTemplate, filename, addReferences);
					} else if (typeof jsonItem === "object") {
						// If it's an object, recurse
						if (typeof schemaTemplate === "object") {
							extract(jsonItem, schemaTemplate, path);
						} else {
							// Edge case: handles cases like keywords: ["string1", "string2"]
							// when the schema has keywords: ["keyword context"]
							for (const key of Object.keys(jsonItem)) {
								if (typeof jsonItem[key] === "string") {
									addTranslation(
										jsonItem[key],
										schemaTemplate,
										filename,
										addReferences,
									);
								}
							}
						}
					}
				}
			}
		}

		/**
		 * Adds a translation to the translations array
		 * @param {string} msgctxt - The context of the text to be translated
		 * @param {string} msgid - The text to be translated
		 * @param {string} filename - The name of the file for references
		 * @param {boolean} addReferences - Whether to add references
		 */
		function addTranslation(msgctxt, msgid, filename, addReferences) {
			if (!msgctxt) return; // Do not add empty strings

			const translation = {
				msgid,
				msgctxt,
			} as Block;

			if (addReferences) {
				translation.comments = {
					reference: [filename],
				};
			}

			translations.push(translation);
		}

		// Start extraction from the root
		extract(json, schema);

		return translations;
	}
}
