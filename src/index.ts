#!/usr/bin/env node
import { getArgs } from "./cli/index.js";
import run from "./run.js";

/** Main execution */
const args = getArgs();
run(args);
