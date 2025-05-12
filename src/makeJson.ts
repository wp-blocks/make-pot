#!/usr/bin/env node

import { getJsonArgs } from "./cli/getJsonArgs";
import { makeJson } from "./jsonCommand";

const args = getJsonArgs();

makeJson(args);
