import { handler } from "../netlify/functions/gamification-api";
import { netlifyToVercel } from "./_utils/vercelWrapper";

export default netlifyToVercel(handler);
