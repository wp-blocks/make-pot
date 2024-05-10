#!/usr/bin/env node
import { getArgs } from "./cli/getArgs.js";
import run from "./run.js";

export { makePot } from "./parser/makePot.js";
export { doTree } from "./parser/tree.js";

/** Main execution */
const args = getArgs();
run(args);
