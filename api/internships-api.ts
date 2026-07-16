import { handler } from "../netlify/functions/internships-api";
import { netlifyToVercel } from "./_utils/vercelWrapper";

export default netlifyToVercel(handler);
