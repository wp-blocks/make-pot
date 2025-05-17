#!/usr/bin/env node

import { getJsonArgs } from "./cli/getJsonArgs.js";
import makeJson from "./jsonCommand.js";

const args = getJsonArgs();

makeJson(args);
