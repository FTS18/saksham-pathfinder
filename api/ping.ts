import { getAuth } from "firebase-admin/auth"; export default function handler(req, res) { res.status(200).json({ ok: true, msg: "pong v5 auth" }); }
