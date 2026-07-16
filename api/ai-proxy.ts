import { handler } from "../netlify/functions/ai-proxy.js";
import { netlifyToVercel } from "./_utils/vercelWrapper.js";

export default netlifyToVercel(handler);
