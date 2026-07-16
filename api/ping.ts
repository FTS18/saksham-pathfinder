import { getApps } from "firebase-admin/app"; export default function handler(req, res) { res.status(200).json({ ok: true, msg: "pong v3", apps: getApps().length }); }
