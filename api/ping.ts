import { getFirestore } from "firebase-admin/firestore"; export default function handler(req, res) { res.status(200).json({ ok: true, msg: "pong v4 firestore" }); }
