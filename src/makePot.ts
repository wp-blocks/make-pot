#!/usr/bin/env node

import { getArgs } from "./cli/getArgs.js";
import makepotCommand from "./potCommand";
import type { Args } from "./types";

/** Main execution */
makepotCommand(getArgs() as Args);
