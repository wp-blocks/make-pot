import type { Args } from './types'
import path from 'path'
import fs from 'fs/promises'
import { generatePotHeader } from './utils'

export async function writePotFile (args: Args, fileContent: string): Promise<void> {
  // the path to the .pot file
  const potFilePath = path.join(args.destination, `${args.slug}.pot`)

  await fs.writeFile(potFilePath, generatePotHeader(args) + fileContent)
}
