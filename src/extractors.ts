import path from 'path'
import fs from 'fs'
import { type Args } from './types'
import { pkgJsonHeaders, pluginHeaders, themeHeaders } from './const'
import { getCommentBlock, removeCommentMarkup } from './utils'

// TODO: package.json "files" could be used to get the file list
export function extractPackageData (args: Args, fields = pkgJsonHeaders): Record<string, string> {
  const pkgJsonMeta: Record<string, string> = {}
  // read the package.json file
  const packageJsonPath = args.sourceDirectory ? path.join(args.sourceDirectory, 'package.json') : 'package.json'
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    // extract the fields from the package.json file
    for (const field of Object.keys(fields)) {
      if (packageJson[field] !== undefined) {
        pkgJsonMeta[field] = packageJson[field]
      }
    }
  }
  return pkgJsonMeta
}

function parsePHPFile (phpContent: string): Record<string, string> {
  const match = phpContent.match(/\/\*\*([\s\S]*?)\*\//)

  if (match && match[1]) {
    const commentBlock = match[1]
    const lines = commentBlock.split('\n')

    const pluginInfo: Record<string, string> = {}

    for (const line of lines) {
      const keyValueMatch = line.match(/^\s*\*\s*([^:]+):\s*(.*)/)

      if (keyValueMatch && keyValueMatch[1] && keyValueMatch[2]) {
        let header = keyValueMatch[1].trim()
        header = pluginHeaders[header as keyof typeof pluginHeaders] ?? header
        pluginInfo[header] = keyValueMatch[2].trim()
      }
    }
    return pluginInfo
  }
  return {}
}

export function extractFileData (fileContent: string): Record<string, string> {
  const data: Record<string, string> = {}

  // split by lines and trim every line
  fileContent
    .split('\n')
    .map(line => line.trim())
    .map(line => removeCommentMarkup(line))
    // split each line by colon trim each part and add to data
    .forEach(line => {
      const parts = line.split(':')
      if (parts[1] === undefined) {
        return
      }
      data[parts[0]?.trim()] = parts[1]?.trim()
    })

  return data
}

export function extractMainFileData (args: Args) {
  let fileData: Record<string, string> = {}
  const sourceDir = args.sourceDirectory ? path.join(process.cwd(), args.sourceDirectory) : process.cwd()
  if (['plugin', 'block', 'generic'].includes(args.domain)) {
    const folderPhpFile = sourceDir + args.slug + '.php'
    if (fs.existsSync(folderPhpFile)) {
      const fileContent = fs.readFileSync(folderPhpFile, 'utf8')

      fileData = parsePHPFile(fileContent)

      if ('Plugin Name' in fileData) {
        console.log('Plugin file detected.')
        console.log(`Plugin file: ${folderPhpFile}`)
        args.domain = 'plugin'
      }
    } else {
      console.log('Plugin file not found.')
      console.log(`Missing Plugin filename: ${folderPhpFile}`)
    }
  } else if (['theme', 'theme-block'].includes(args.domain)) {
    const styleCssFile = sourceDir + 'style.css'

    if (fs.existsSync(styleCssFile)) {
      const fileContent = fs.readFileSync(styleCssFile, 'utf8')
      const commentBlock = getCommentBlock(fileContent)
      fileData = extractFileData(commentBlock)

      console.log('Theme stylesheet detected.')
      console.log(`Theme stylesheet: ${styleCssFile}`)
      args.domain = 'theme'
    } else {
      console.log('Theme stylesheet not found in ' + path.resolve(sourceDir))
    }
  }

  return fileData
}
