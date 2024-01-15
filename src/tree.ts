#!/usr/bin/env node
import Parser, { type SyntaxNode, Tree } from 'tree-sitter'
// @ts-expect-error
import Js from 'tree-sitter-javascript'
// @ts-expect-error
import Php from 'tree-sitter-php'
// @ts-expect-error
import Ts from 'tree-sitter-typescript'
import path from 'path'
import { type TranslationString } from './types'
import { i18nFunctions } from './const'
import { SingleBar } from 'cli-progress'
import { readFileSync } from 'fs'

/**
 * Extract strings from a file 🌳
 *
 * @param {Tree} node
 * @param {string} lang
 * @param {string} filename
 * @return {{}}
 */
export function extractStrings (node: SyntaxNode, lang: Parser | null, filename: string): TranslationString[] {
  const matches: TranslationString[] = []
  const typeToMatch = lang !== Php ? 'call_expression' : 'function_call_expression'

  /**
   * Traverse the tree 🌳
   *
   * @param {SyntaxNode} node The node to traverse through
   * @param {SyntaxNode|null} previousNode The previous node in the tree
   */
  function traverse (node: SyntaxNode, previousNode: SyntaxNode | null = null): void {
    if (node.type === typeToMatch) {
      const functionNameNode = node.firstChild
      const functionName = functionNameNode?.text ?? null

      if (functionName === null || !Object.keys(i18nFunctions).includes(functionName)) {
        return
      }

      const argsNode = node.lastChild

      if (
        argsNode === null ||
        argsNode.childCount === 0 ||
        argsNode.type !== 'arguments'
      ) {
        return
      }

      const [fn, raw] = node.children
      const translation: string[] = []
      raw.children
        .slice(1, -1)
        .forEach(
          (child) => {
            if (child.text !== ',') translation.push(child.text.slice(1, -1))
          }
        )

      let comments

      while (previousNode !== null && previousNode.type !== 'comment') {
        previousNode = previousNode.previousSibling
      }

      if (previousNode?.type === 'comment' && previousNode.text.includes('translators:')) {
        comments = previousNode.text.trim()
      }

      const type = i18nFunctions[fn.text as keyof typeof i18nFunctions] ?? 'text_domain'
      const position = node.startPosition

      matches.push({
        reference: `#: ${filename}:${position.row + 1}`,
        type,
        raw: translation,
        msgid: translation[0],
        comments
      })
    }

    for (const child of node.children) {
      traverse(child, node)
    }
  }

  traverse(node)

  // Return both matches and entries
  return matches
}

const extractNames = (items: any[]): string[] =>
  items.map((item: any) => item.name);

function parseBlockJson(jsondata: string): Record<string, any> {
  const json = JSON.parse(jsondata);
  return {
    title: json?.title ?? undefined,
    description: json?.description ?? undefined,
    keywords: json?.keywords ?? undefined,
    styles: json?.styles ? extractNames(json.styles) : undefined,
    variations: json?.variations?.map((variation: any) => ({
      title: variation?.title ?? undefined,
      description: variation?.description ?? undefined,
      keywords: variation?.keywords ?? undefined,
    })) ?? undefined,
  };
}

function parseThemeJson(jsondata: string): Record<string, any> {
  const json = JSON.parse(jsondata);

  const settings = json.settings;
  const typography = settings?.typography || {};
  const color = settings?.color || {};
  const spacing = settings?.spacing || {};
  const blocks = settings?.blocks || {};

  return {
    title: json.title,
    settings: {
      typography: {
        fontSizes: typography.fontSizes ? extractNames(typography.fontSizes) : [],
        fontFamilies: typography.fontFamilies ? extractNames(typography.fontFamilies) : [],
      },
      color: {
        palette: color.palette ? extractNames(color.palette) : [],
        gradients: color.gradients ? extractNames(color.gradients) : [],
        duotone: color.duotone ? extractNames(color.duotone) : [],
      },
      spacing: {
        spacingSizes: spacing.spacingSizes ? extractNames(spacing.spacingSizes) : [],
      },
      blocks: Object.keys(blocks).reduce((acc: any, key: string) => {
        const block = blocks[key];
        acc[key] = {
          typography: {
            fontSizes: block.typography?.fontSizes ? extractNames(block.typography.fontSizes) : [],
            fontFamilies: block.typography?.fontFamilies ? extractNames(block.typography.fontFamilies) : [],
          },
          color: {
            palette: block.color?.palette ? extractNames(block.color.palette) : [],
            gradients: block.color?.gradients ? extractNames(block.color.gradients) : [],
          },
          spacing: {
            spacingSizes: block.spacing?.spacingSizes ? extractNames(block.spacing.spacingSizes) : [],
          },
        };
        return acc;
      }, {}),
    },
    customTemplates: json.customTemplates ? json.customTemplates.map((template: any) => template.title) : [],
    templateParts: json.templateParts ? json.templateParts.map((templatePart: any) => templatePart.title) : [],
  };
}

const blockJsonComments = {
  title: "block title",
  description: "block description",
  keywords: "block keywords",
}
const themeJsonComments = {
  title: "Theme Name of the theme",
  description: "Description of the theme"
}

function getJsonComment(key: string, type?: 'block.json' | 'theme.json') : string {
  const comments = type === 'block.json' ? blockJsonComments : themeJsonComments
  return key in comments ? comments[key as keyof typeof comments] : key
}

function jsonString( key: string, data: string, path: string, type?: 'block.json' | 'theme.json'): TranslationString {
  return {
    reference: `#: ${path}`,
    type: 'msgid',
    raw: [key, data],
    msgid: data,
    msgctxt: getJsonComment(key, type),
  }
}

/**
 * Parse a file and extract strings asynchronously
 *
 * @param {object} args
 * @param {string} args.filepath - Path to the file to parse
 * @param {Parser|null} args.language - Language of the file to parse
 * @return {Promise<TranslationString[]>}
 */
export async function parseFile (args: { filepath: string, language: Parser | string, stats ?: { bar: SingleBar, index: number } }): Promise<TranslationString[] | null> {
  // check if the language is supported
  if (typeof args.language === 'string') {
    if (args.language === 'json') {
      const filename = path.basename(args.filepath)
      let parsed: Record<string, any> | null = null
      // parse the file based on the filename
      switch (filename) {
        case 'block.json':
          args.stats?.bar.increment(0, { filename: 'Parsing block.json' })
          parsed = parseBlockJson(readFileSync(path.resolve(args.filepath), 'utf8'))
          break
        case 'theme.json':
          args.stats?.bar.increment(0, { filename: 'Parsing theme.json' })
          parsed = parseThemeJson(readFileSync(path.resolve(args.filepath), 'utf8'))
          break
      }

      if (parsed !== null) {

        // extract the strings from the file and return them as an array of objects
        return Object.entries(parsed as Record<string, string | string[]>)

          // return the translations for each key in the json data
          .map(([key, jsonData]) => {

            // if is a string return a single json string
            if (typeof jsonData === 'string') {
              return jsonString(key, jsonData, args.filepath, filename as 'block.json' | 'theme.json')
            } else {
              args.stats?.bar.increment(0, { filename: 'not a string' })
            }

            if (!jsonData) {
              args.stats?.bar.increment(0, { filename:  `Skipping ${key} in ${args.filepath} as ${filename} ... cannot parse data`})

              return null
            }

            // if is an object return an array of json strings
            Object.entries(jsonData).map(
              ([k, v]) => jsonString(k, v as string, args.filepath)
            )
          })
          .flat() as TranslationString[]
      }
    }
    console.log(`Skipping ${args.filepath}... No parser found for ${args.language} file`)
    return null
  }

  // read the file
  const sourceCode = readFileSync(path.resolve(args.filepath), 'utf8')

  // log the filepath
  if (args.stats) {
    args.stats.bar.increment(1, { filename: args.filepath + ' (' + args.stats.index + ')' })
  }

  // set up the parser
  const parser = new Parser()
  parser.setLanguage(args.language)

  // parse the file
  const tree = parser.parse(sourceCode) // Assuming parse is an async operation

  // extract the strings from the file and return them
  return extractStrings(tree.rootNode, args.language, args.filepath)
}

/**
 * Return the parser based on the file extension
 *
 * @param file - Path to the file
 * @return {Parser|{}|null} - the parser to be used with the file or null if no parser is found
 */
export function getParser (file: string): string | Parser {
  const ext = file.split('.').pop()
  switch (ext) {
    case 'ts':
      return Ts.typescript
    case 'tsx':
      return Ts.tsx
    case 'js':
    case 'jsx':
    case 'mjs':
    case 'cjs':
      return Js
    case 'php':
      return Php
    default:
      return ext as string
  }
}
