import StringAuditor from "./extractors/auditStrings.js";
import makeJson from "./jsonCommand.js";
import makePot from "./potCommand.js";

export { MakeJsonCommand } from "./parser/makeJson";
export { makePot as makePotCommand } from "./parser/makePot.js";
export { doTree } from "./parser/tree.js";
export { parseJsonFile } from "./extractors/json.js";
export {
	extractMainFileData,
	generateHeader,
	getAuthorFromPackage,
} from "./extractors/headers.js";

export { makeJson, makePot, StringAuditor };
