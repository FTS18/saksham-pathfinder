import { handler } from "../netlify/functions/admin-api";
import { netlifyToVercel } from "./_utils/vercelWrapper";

export default netlifyToVercel(handler);
