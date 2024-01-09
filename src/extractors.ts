import path from 'path'
import fs from 'fs'
import { type Args } from './types'
import { pkgJsonHeaders } from './const'

function getCommentBlock (fileContent: string): string {
  const commentBlock = fileContent.match(/\/\*\*?[\s\S]*?\*\//)
  return commentBlock !== null ? commentBlock[0] : ''
}

// TODO: package.json "files" could be used to get the file list
export function extractPackageData (args: Args, fields = pkgJsonHeaders): Record<string, string> {
  const pkgJsonMeta: Record<string, string> = {}
  // read the package.json file
  const packageJsonPath = path.join(args.sourceDirectory, 'package.json')
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    // extract the fields from the package.json file
    for (const field of fields) {
      if (packageJson[field] !== undefined) {
        pkgJsonMeta[field] = packageJson[field]
      }
    }
  }
  return pkgJsonMeta
}

export function extractFileData (fileContent: string): Record<string, string> {
  const data: Record<string, string> = {}

  // split by lines and trim every line
  fileContent
    .split('\n')
    .map(line => line.trim())
    .map(line => line.replace(/^\/\*+|\*+\/$/g, ''))
    // split each line by colon trim each part and add to data
    .forEach(line => {
      const parts = line.split(':')
      data[parts[0]?.trim()] = parts[1]?.trim()
    })

  return data
}

export function extractMainFileData (args: Args) {
  if (['theme', 'generic'].includes(args.domain)) {
    const folderPhpFile = path.join(args.sourceDirectory, args.slug + '.php')
    if (fs.existsSync(folderPhpFile)) {
      const fileContent = fs.readFileSync(folderPhpFile, 'utf8')

      const commentBlock = getCommentBlock(fileContent)
      const fileData = extractFileData(commentBlock)

      if ('Plugin Name' in fileData) {
        console.log('Plugin file detected.')
        console.log(`Plugin file: ${folderPhpFile}`)
        args.domain = 'plugin'

        return fileData
      }
    } else {
      console.log('Plugin file not found.')
      console.log(`Plugin file: ${folderPhpFile}`)
    }
  } else if (['plugin', 'block', 'generic'].includes(args.domain)) {
    const styleCssFile = path.join(args.sourceDirectory, 'style.css')

    if (fs.existsSync(styleCssFile)) {
      const fileContent = fs.readFileSync(styleCssFile, 'utf8')
      const commentBlock = getCommentBlock(fileContent)
      const fileData = extractFileData(commentBlock)

      console.log('Theme stylesheet detected.')
      console.log(`Theme stylesheet: ${styleCssFile}`)
      args.domain = 'theme'

      return fileData
    } else {
      console.log('Theme stylesheet not found.')
      console.log(`Theme stylesheet: ${styleCssFile}`)
    }
  }
}
