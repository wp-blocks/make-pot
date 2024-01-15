import { type Args } from "./types";
import path from "path";
import fs from "fs";
import { generatePotHeader } from "./utils";

function ensureFolderExists(folderPath: string | undefined): string {
  if (folderPath === undefined) {
    return ".";
  }
  try {
    // Check if the folder exists
    fs.accessSync(
      path.resolve(folderPath),
      fs.constants.R_OK | fs.constants.W_OK,
    );
  } catch (error: ErrorEvent | any) {
    if (error.code === "ENOENT") {
      // The Folder does not exist, so create it
      fs.mkdirSync(folderPath, { recursive: true });
      console.log(`Folder created: ${folderPath}`);
      return folderPath;
    }
  }
  return folderPath;
}

/**
 * Writes the .pot file to disk
 * @param args
 * @param fileContent
 */
export async function writePotFile(args: Args, fileContent: string) {
  // the path to the .pot file
  const potFilePath = args.destination
    ? path.join(process.cwd(), args.destination, `${args.slug}.pot`)
    : path.join(process.cwd(), `${args.slug}.pot`);

  if (args.headers === undefined) {
    console.log("No headers provided. Skipping header generation.");
  }

  if (ensureFolderExists(args.destination)) {
    fs.writeFileSync(potFilePath, generatePotHeader(args) + fileContent);
  }
}
