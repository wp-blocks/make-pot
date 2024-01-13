#!/usr/bin/env node
import Parser, { type SyntaxNode, Tree } from 'tree-sitter'
// @ts-expect-error
import Js from 'tree-sitter-javascript'
// @ts-expect-error
import Php from 'tree-sitter-php'
// @ts-expect-error
import Ts from 'tree-sitter-typescript'
import path from 'path'
import { readFile } from 'fs/promises'
import { type TranslationString } from './types'
import { i18nFunctions } from './const'

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
          const [fn, raw] = node.children.map(argNode => argNode.text.trim())

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

          // the function used for translation
          const type = i18nFunctions[fn as keyof typeof i18nFunctions] || 'text_domain'
          // The position of the translation in the file
          const position = node.startPosition
          // extract the values from the raw translation - ATM the content of the parsed raw is a sting like ('translation', 'td') and maybe with formatting characters like \n or \t
          const parsedRaw = raw
            .slice(1, -1) // remove enclosing parentheses
            .split(',') // split on comma
            .map(str => str.trim().slice(1, -1)) // remove enclosing quotes

          matches.push({
            type,
            raw: parsedRaw,
            msgid: parsedRaw[0],
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
      type: '',
      raw: [],
      msgid: [sourceCode],
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
