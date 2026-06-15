// 2026 FIFA World Cup — 48 teams.
// NOTE: this list reflects qualified teams as best known at scaffold time.
// Update freely as the actual qualifier list firms up. The `code` is the
// stable identifier we store in the DB; `name` and `flag` are display-only.
export const TEAMS = [
  // Hosts
  { code: 'USA', name: 'United States', flag: 'US' },
  { code: 'CAN', name: 'Canada', flag: 'CA' },
  { code: 'MEX', name: 'Mexico', flag: 'MX' },
  // CONMEBOL
  { code: 'ARG', name: 'Argentina', flag: 'AR' },
  { code: 'BRA', name: 'Brazil', flag: 'BR' },
  { code: 'URU', name: 'Uruguay', flag: 'UY' },
  { code: 'COL', name: 'Colombia', flag: 'CO' },
  { code: 'ECU', name: 'Ecuador', flag: 'EC' },
  { code: 'PAR', name: 'Paraguay', flag: 'PY' },
  // UEFA
  { code: 'ESP', name: 'Spain', flag: 'ES' },
  { code: 'FRA', name: 'France', flag: 'FR' },
  { code: 'ENG', name: 'England', flag: 'GB' },
  { code: 'GER', name: 'Germany', flag: 'DE' },
  { code: 'ITA', name: 'Italy', flag: 'IT' },
  { code: 'NED', name: 'Netherlands', flag: 'NL' },
  { code: 'POR', name: 'Portugal', flag: 'PT' },
  { code: 'BEL', name: 'Belgium', flag: 'BE' },
  { code: 'CRO', name: 'Croatia', flag: 'HR' },
  { code: 'SUI', name: 'Switzerland', flag: 'CH' },
  { code: 'DEN', name: 'Denmark', flag: 'DK' },
  { code: 'AUT', name: 'Austria', flag: 'AT' },
  { code: 'POL', name: 'Poland', flag: 'PL' },
  { code: 'SRB', name: 'Serbia', flag: 'RS' },
  { code: 'TUR', name: 'Turkey', flag: 'TR' },
  { code: 'NOR', name: 'Norway', flag: 'NO' },
  { code: 'CZE', name: 'Czechia', flag: 'CZ' },
  // CAF
  { code: 'MAR', name: 'Morocco', flag: 'MA' },
  { code: 'SEN', name: 'Senegal', flag: 'SN' },
  { code: 'EGY', name: 'Egypt', flag: 'EG' },
  { code: 'TUN', name: 'Tunisia', flag: 'TN' },
  { code: 'ALG', name: 'Algeria', flag: 'DZ' },
  { code: 'NGA', name: 'Nigeria', flag: 'NG' },
  { code: 'CIV', name: 'Ivory Coast', flag: 'CI' },
  { code: 'CMR', name: 'Cameroon', flag: 'CM' },
  { code: 'GHA', name: 'Ghana', flag: 'GH' },
  // AFC
  { code: 'JPN', name: 'Japan', flag: 'JP' },
  { code: 'KOR', name: 'South Korea', flag: 'KR' },
  { code: 'IRN', name: 'Iran', flag: 'IR' },
  { code: 'AUS', name: 'Australia', flag: 'AU' },
  { code: 'KSA', name: 'Saudi Arabia', flag: 'SA' },
  { code: 'IRQ', name: 'Iraq', flag: 'IQ' },
  { code: 'UZB', name: 'Uzbekistan', flag: 'UZ' },
  { code: 'JOR', name: 'Jordan', flag: 'JO' },
  // CONCACAF
  { code: 'CRC', name: 'Costa Rica', flag: 'CR' },
  { code: 'PAN', name: 'Panama', flag: 'PA' },
  { code: 'JAM', name: 'Jamaica', flag: 'JM' },
  // OFC
  { code: 'NZL', name: 'New Zealand', flag: 'NZ' },
  // Playoff slot — replace with actual winner once decided
  { code: 'TBD', name: 'Inter-confederation playoff', flag: '??' },
];

export const TEAM_BY_CODE = Object.fromEntries(TEAMS.map(t => [t.code, t]));

// 2026 World Cup groups (12 groups of 4). The codes match TEAMS above.
// Update freely to match the actual draw — this is reference data only,
// no scoring depends on it.
export const GROUPS = [
  { label: 'A', teams: ['MEX', 'COL', 'SEN', 'CZE'] },
  { label: 'B', teams: ['CAN', 'URU', 'EGY', 'GHA'] },
  { label: 'C', teams: ['USA', 'CRO', 'NGA', 'JOR'] },
  { label: 'D', teams: ['ARG', 'JPN', 'AUT', 'IRQ'] },
  { label: 'E', teams: ['ESP', 'ITA', 'TUN', 'UZB'] },
  { label: 'F', teams: ['FRA', 'MAR', 'POL', 'CMR'] },
  { label: 'G', teams: ['ENG', 'KOR', 'ALG', 'CRC'] },
  { label: 'H', teams: ['BRA', 'ECU', 'KSA', 'PAN'] },
  { label: 'I', teams: ['POR', 'SUI', 'CIV', 'JAM'] },
  { label: 'J', teams: ['NED', 'DEN', 'SRB', 'NZL'] },
  { label: 'K', teams: ['GER', 'AUS', 'TUR', 'PAR'] },
  { label: 'L', teams: ['BEL', 'IRN', 'NOR', 'TBD'] },
];

// Bracket: 31 matches in IDs 1..31. See supabase/schema.sql for the layout.
// Helpers below compute round + parent/child relationships from the ID alone.
export const ROUND_OF = (id) => {
  if (id <= 16) return 'R32';
  if (id <= 24) return 'R16';
  if (id <= 28) return 'QF';
  if (id <= 30) return 'SF';
  return 'F';
};

export const POINTS_FOR_ROUND = (round) => (round === 'R32' ? 2 : 3);
export const CHAMPION_BONUS = 10;

// Match that the winner of `id` advances into, plus the slot they fill.
//   slot: 'home' | 'away'
export function nextMatch(id) {
  if (id === 31) return null;
  if (id <= 16) {
    const next = 16 + Math.ceil(id / 2);
    return { id: next, slot: id % 2 === 1 ? 'home' : 'away' };
  }
  if (id <= 24) {
    const local = id - 16; // 1..8
    const next = 24 + Math.ceil(local / 2);
    return { id: next, slot: local % 2 === 1 ? 'home' : 'away' };
  }
  if (id <= 28) {
    const local = id - 24; // 1..4
    const next = 28 + Math.ceil(local / 2);
    return { id: next, slot: local % 2 === 1 ? 'home' : 'away' };
  }
  // SF (29, 30) → F (31)
  return { id: 31, slot: id === 29 ? 'home' : 'away' };
}

// Inverse: which two earlier matches feed into `id`?
export function feederMatches(id) {
  if (id <= 16) return null; // R32 has no feeders
  if (id <= 24) {
    const local = id - 16; // 1..8
    return [2 * local - 1, 2 * local];
  }
  if (id <= 28) {
    const local = id - 24; // 1..4
    return [16 + 2 * local - 1, 16 + 2 * local];
  }
  if (id <= 30) {
    const local = id - 28; // 1..2
    return [24 + 2 * local - 1, 24 + 2 * local];
  }
  return [29, 30]; // F
}
