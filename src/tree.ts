#!/usr/bin/env node
import Parser, { type SyntaxNode, Tree } from 'tree-sitter'
// @ts-expect-error
import Ts from 'tree-sitter-typescript'
// @ts-expect-error
import Js from 'tree-sitter-javascript'
// @ts-expect-error
import Php from 'tree-sitter-php'
import path from 'path'
import { readFile } from 'fs/promises'
import { type TranslationString } from './types'
import { i18nFunctions } from './const'
import {readFileSync} from "fs";

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
      const functionName = functionNameNode !== null ? functionNameNode.text : null

      if (functionName && Object.keys(i18nFunctions).includes(functionName)) {
        const argsNode = node.lastChild

        // Extract the metadata
        if (argsNode !== null && argsNode.childCount > 0 && argsNode.type === 'arguments') {
          // Extract the msgid
          const firstArgNode = argsNode.firstChild!
          const raw = node.children.map(argNode => argNode.text)

          let comments
          // Find the preceding comment node at the same level as the translation function call.
          let nodeToCheck = previousNode
          while (nodeToCheck !== null && nodeToCheck.type !== 'comment') {
            nodeToCheck = nodeToCheck.previousSibling
          }
          // If the node is a comment, extract the comment text
          if (nodeToCheck !== null && nodeToCheck.type === 'comment') {
            const commentText = nodeToCheck.text.trim()
            if (commentText.includes('translators:')) {
              comments = commentText
            }
          }

          const type = i18nFunctions[raw[0] as keyof typeof i18nFunctions] || 'text_domain'
          const position = node.startPosition
          const parsedString = raw[1].slice(1, -1).split(',')

          matches.push({
            type,
            raw: raw.join(''),
            msgid: parsedString.length !== 4 ? parsedString[0] : [parsedString[0], parsedString[1]],
            count: parsedString.length === 4 ? parsedString[2] : undefined,
            msgctxt: parsedString.length === 3 ? parsedString[1] : undefined,
            comments,
            reference: `#: ${filename}:${position.row + 1}:${position.column + 1}` // Adjusted to be 1-indexed
          } as TranslationString)
        }
      }
    }

    if (node.children.length > 0) {
      for (const child of node.children) {
        // Make sure to pass the current node as previousNode to the next level of recursion.
        traverse(child, node)
      }
    }
  }

  traverse(node)

  // Return both matches and entries
  return matches
}

/**
 * Parse a file and extract strings
 *
 * @param {object} args
 * @param {string} args.filepath - Path to the file to parse
 * @param {Parser|null} args.language - Language of the file to parse
 * @return {{}}
 */
/**
 * Parse a file and extract strings asynchronously
 *
 * @param {object} args
 * @param {string} args.filepath - Path to the file to parse
 * @param {Parser|null} args.language - Language of the file to parse
 * @return {Promise<TranslationString[]>}
 */
export async function parseFile (args: { filepath: string, language: Parser | null }): Promise<TranslationString[]> {
  // log the filepath
  console.log('Parsing ', args.filepath)

  // read the file
  const sourceCode = await readFile(path.resolve(args.filepath), 'utf8')

  if (args.language === null) {
    return [{
      msgid: sourceCode,
      reference: '#: ' + args.filepath + '  } '
    }]
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
 * @param file - Path to the file
 * @return {*|{}|string} - Parser
 */
export function getParser (file: string): null | Parser {
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
      return null
  }
}
