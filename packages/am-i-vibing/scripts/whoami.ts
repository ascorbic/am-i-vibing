import { detectAgenticEnvironment } from "../src/index.js";

const result = await detectAgenticEnvironment();
console.log("Detected Agentic Environment:");
console.log(JSON.stringify(result, null, 2));
