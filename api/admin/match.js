import { checkPassword, adminClient, readJson } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const body = await readJson(req);
  if (!checkPassword(body.password)) return res.status(401).json({ ok: false });

  const { id, winner } = body;
  if (!Number.isInteger(id) || id < 1 || id > 31) {
    return res.status(400).json({ ok: false, error: 'bad id' });
  }

  const sb = adminClient();
  const { error } = await sb.from('matches')
    .update({
      winner: winner ?? null,
      played_at: winner ? new Date().toISOString() : null,
    })
    .eq('id', id);
  if (error) return res.status(500).json({ ok: false, error: error.message });
  return res.status(200).json({ ok: true });
}
