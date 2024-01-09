import { type Args } from './types'

export function generatePotHeader (args: Args) {
  return `# Copyright (C) ${new Date().getFullYear()} ${args.meta?.author ?? 'USER'} (${args.meta?.email ?? 'USER'})
# This file is distributed under the ${args.meta?.license ?? 'GPL2 or later.'}.
msgid ""
msgstr ""
"Project-Id-Version: ${args.packageName} ${args.meta?.version ?? '1.0'}\\n"
"Report-Msgid-Bugs-To: ${args.meta?.bugsTo ?? ''}\\n"
"Last-Translator: ${args.meta?.author ?? 'USER'} ${args.meta?.email ?? 'USER'}\\n"
"Language-Team: LANGUAGE <LL@li.org>\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=UTF-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"POT-Creation-Date: ${new Date().toISOString()}\\n"
"PO-Revision-Date: YEAR-MO-DA HO:MI+ZONE\\n"
"X-Generator: ${args.packageName}\\n"
"Plural-Forms: nplurals=2; plural=(n != 1);\\n"
`
}

export function getCommentBlock (input: string): string {
  const commentBlock = input.match(/\/\*\*?[\s\S]*?\*\//)
  return commentBlock !== null ? commentBlock[0] : input
}

export function removeCommentMarkup (input: string): string {
  return input.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '')
}
