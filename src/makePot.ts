#!/usr/bin/env node

import { getArgs } from "./cli/getArgs.js";
import makepotCommand from "./potCommand.js";
import type { Args } from "./types.js";

/** Main execution */
makepotCommand(getArgs() as Args);
