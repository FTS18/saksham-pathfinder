import { handler } from "../netlify/functions/ai-proxy";
import { netlifyToVercel } from "./_utils/vercelWrapper";

export default netlifyToVercel(handler);
