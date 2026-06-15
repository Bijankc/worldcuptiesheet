import { checkPassword, adminClient, readJson } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const body = await readJson(req);
  if (!checkPassword(body.password)) return res.status(401).json({ ok: false });

  const { id, team_home, team_away, winner } = body;
  if (!Number.isInteger(id) || id < 1 || id > 31) {
    return res.status(400).json({ ok: false, error: 'bad id' });
  }
  if (winner && winner !== team_home && winner !== team_away) {
    return res.status(400).json({ ok: false, error: 'winner must be one of the listed teams' });
  }

  const sb = adminClient();
  const { error } = await sb.from('matches')
    .update({
      team_home: team_home ?? null,
      team_away: team_away ?? null,
      winner: winner ?? null,
      played_at: winner ? new Date().toISOString() : null,
    })
    .eq('id', id);
  if (error) return res.status(500).json({ ok: false, error: error.message });
  return res.status(200).json({ ok: true });
}
