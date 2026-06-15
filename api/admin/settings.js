import { checkPassword, adminClient, readJson } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const body = await readJson(req);
  if (!checkPassword(body.password)) return res.status(401).json({ ok: false });

  const { key, value } = body;
  if (!key || typeof value !== 'string') {
    return res.status(400).json({ ok: false, error: 'bad payload' });
  }

  const sb = adminClient();
  const { error } = await sb.from('app_settings')
    .upsert({ key, value }, { onConflict: 'key' });
  if (error) return res.status(500).json({ ok: false, error: error.message });
  return res.status(200).json({ ok: true });
}
