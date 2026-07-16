import { handler } from "../netlify/functions/parse-resume.js";
import { netlifyToVercel } from "./_utils/vercelWrapper.js";

export default netlifyToVercel(handler);
