import { handler } from "../netlify/functions/recruiter-api.js";
import { netlifyToVercel } from "./_utils/vercelWrapper.js";

export default netlifyToVercel(handler);
