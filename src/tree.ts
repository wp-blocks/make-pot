#!/usr/bin/env node
import Parser, {SyntaxNode, Tree} from 'tree-sitter'
// @ts-ignore
import Ts from 'tree-sitter-typescript'
// @ts-ignore
import Js from 'tree-sitter-javascript'
// @ts-ignore
import Php from 'tree-sitter-php'
import path from 'path'
import {readFile} from 'fs/promises'
import {TranslationString} from "./types";

/**
 * Extract strings from a file 🌳
 *
 * @param {Tree} node
 * @param {string} lang
 * @param {string} filename
 * @return {{}}
 */
export function extractStrings (node: SyntaxNode, lang: string, filename: string): TranslationString[] {
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
      let meta = {}
      const functionName = functionNameNode !== null ? functionNameNode.text : null

      if (functionName?.match(/^(_n|_x|_nx|__|_e)$/) !== null) {
        const argsNode = node.lastChild
        const [fnName, ...msgid] = node.children.map(argNode => argNode.text) as string[]

        // Extract the metadata
        if (argsNode !== null && argsNode.childCount > 0 && argsNode.type === 'arguments') {
          // Extract the msgid
          const firstArgNode = argsNode.firstChild as SyntaxNode
          const msgidNode = firstArgNode.firstChild
          const msgid = msgidNode?.text ?? ''

          // Extract the msgctxt if it exists and unquote it
          const msgctxtNode = firstArgNode.nextNamedSibling
          let msgctxt
          if (msgctxtNode !== null && msgctxtNode.type === 'string') {
            // unquote the string
            msgctxt = msgctxtNode.text.slice(1, -1)
          }

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

          const position = node.startPosition
          meta = {
            msgid,
            msgctxt,
            comments,
            reference: `#: ${filename}:${position.row + 1}:${position.column + 1}` // Adjusted to be 1-indexed
          }
        }

        matches.push({ ...meta, msgid } as TranslationString)
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
 * @param {string} args.language - Language of the file to parse
 * @return {{}}
 */
export async function parseFile (args: { filepath: string; language: string }): Promise<TranslationString[]> {
  const sourceCode = await readFile(path.resolve(args.filepath), 'utf8')

  if (args.language === 'Text') {
    return [{
        msgid: sourceCode,
        reference: '#: ' + args.filepath + '  } ',
    }]
  } else if (args.language === 'Json') {
    return [{
        msgid: JSON.parse(sourceCode),
        reference: '#: ' + args.filepath + '  } ',
    }]
  }

  const parser = new Parser()
  parser.setLanguage(args.language)
  const tree = parser.parse(sourceCode)

  return extractStrings(tree.rootNode as SyntaxNode, args.language, args.filepath) // Assuming extractStrings is synchronous
}

/**
 * Return the parser based on the file extension
 * @param file - Path to the file
 * @return {*|{}|string} - Parser
 */
export function getParser (file: string): any | {} | string {
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
    case 'json':
      return 'Json'
    default:
      return 'Text'
  }
}
