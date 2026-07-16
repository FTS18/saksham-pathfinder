import { handler } from "../netlify/functions/recruiter-api";
import { netlifyToVercel } from "./_utils/vercelWrapper";

export default netlifyToVercel(handler);
