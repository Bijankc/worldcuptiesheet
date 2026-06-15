import { checkPassword, readJson } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const body = await readJson(req);
  if (!checkPassword(body.password)) return res.status(401).json({ ok: false });
  return res.status(200).json({ ok: true });
}
