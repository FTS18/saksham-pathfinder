import { handler } from "../netlify/functions/internships-api.js";
import { netlifyToVercel } from "./_utils/vercelWrapper.js";

export default netlifyToVercel(handler);
