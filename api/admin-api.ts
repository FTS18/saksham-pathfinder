import { handler } from "../netlify/functions/admin-api.js";
import { netlifyToVercel } from "./_utils/vercelWrapper.js";

export default netlifyToVercel(handler);
