import { handler } from "../netlify/functions/gamification-api.js";
import { netlifyToVercel } from "./_utils/vercelWrapper.js";

export default netlifyToVercel(handler);
