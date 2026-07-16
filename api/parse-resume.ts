import { handler } from "../netlify/functions/parse-resume";
import { netlifyToVercel } from "./_utils/vercelWrapper";

export default netlifyToVercel(handler);
