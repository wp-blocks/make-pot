#!/usr/bin/env node
import Parser from 'tree-sitter'
import Ts from 'tree-sitter-typescript'
import Js from 'tree-sitter-javascript'
import Php from 'tree-sitter-php'
import path from 'path'
import { glob } from 'glob'
import { readFile } from 'fs/promises'

/**
 * Extract strings from a file 🌳
 *
 * @param {Tree} node
 * @param {string} lang
 * @param {string} filename
 * @return {{}}
 */
function extractStrings (node, lang, filename) {
  const matches = []
  const typeToMatch = lang !== Php ? 'call_expression' : 'function_call_expression'

  /**
   * Traverse the tree 🌳
   *
   * @param {Tree} node The node to traverse through
   * @param {Tree|null} previousNode The previous node in the tree
   */
  function traverse (node, previousNode = null) {
    if (node.type === typeToMatch) {
      const functionNameNode = node.firstChild
      let meta = {}
      const functionName = functionNameNode !== null ? functionNameNode.text : null

      if (functionName?.match(/^(_n|_x|_nx|__|_e)$/) !== null) {
        const argsNode = node.lastChild
        const [fnName, ...msgid] = node.children.map(argNode => argNode.text)

        // Extract the metadata
        if (argsNode !== null && argsNode.childCount > 0 && argsNode.type === 'arguments') {
          // Extract the msgid
          const firstArgNode = argsNode.firstChild
          const msgidNode = firstArgNode.firstChild
          const msgid = msgidNode?.text

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
            if (commentText.includes('translators:') !== false) {
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

        matches.push({ fnName, ...meta, msgid })
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
async function parseFile (args) {
  const sourceCode = await readFile(path.resolve(args.filepath), 'utf8')

  if (args.language === 'Text') {
    return { text: sourceCode }
  } else if (args.language === 'Json') {
    return JSON.parse(sourceCode)
  }

  const parser = new Parser()
  parser.setLanguage(args.language)
  const tree = parser.parse(sourceCode)

  return extractStrings(tree.rootNode, args.language, args.filepath) // Assuming extractStrings is synchronous
}

/**
 * Return the parser based on the file extension
 * @param file - Path to the file
 * @return {*|{}|string} - Parser
 */
function getParser (file) {
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

async function getFiles (src = 'sourcedir/**') {
  return await glob(src, { nodir: true, cwd: process.cwd() })
}

async function run () {
  const files = await glob('sourcedir/**', { nodir: true, cwd: process.cwd() })
  const parsePromises = files.map(async (file) => {
    console.log('Searching for strings in ' + file)
    const parsed = await parseFile({ filepath: file, language: getParser(file) })
    console.log(parsed)
    return parsed
  })

  const results = await Promise.all(parsePromises)
  console.log(results.flat())
}
const startTime = Date.now()
await run()
console.log('🎉 Done in', Date.now() - startTime, 'ms.')
