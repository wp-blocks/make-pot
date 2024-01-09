import {Args} from "./types";

export function generatePotHeader (args: Args) {
  return `msgid "${args.fileComment}"
msgstr ""
"Project-Id-Version: ${args.packageName}\\n"
"Report-Msgid-Bugs-To: \\n"
"POT-Creation-Date: ${new Date().toISOString()}\\n"
"PO-Revision-Date: YEAR-MO-DA HO:MI+ZONE\\n"
"Last-Translator: ${args.meta?.author ?? 'USER'} ${args.meta?.email ?? 'USER'}\\n"
"Language-Team: LANGUAGE <LL@li.org>\\n"
"Language: \\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=UTF-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"Plural-Forms: nplurals=2; plural=(n != 1);\\n"
`
}
