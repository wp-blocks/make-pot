#!/usr/bin/env node
import { getArgs } from "./cli/getArgs.js";
import potCommand from "./potCommand";

export { makePot } from "./parser/makePot.js";
export { MakeJsonCommand } from "./parser/makeJson.js";
export { doTree } from "./parser/tree.js";

/** Main execution */
const args = getArgs();
potCommand(args);
