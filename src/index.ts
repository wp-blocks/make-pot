import makeJson from "./jsonCommand.js";
import makePot from "./potCommand.js";

export { doTree } from "./parser/tree.js";
export { parseJsonFile } from "./extractors/json.js";
export { extractMainFileData } from "./extractors/headers.js";

export { makeJson, makePot };
export default { makeJson, makePot };
