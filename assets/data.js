// 2026 FIFA World Cup — actual 48 qualified teams.
// Codes are FIFA 3-letter codes (stable identifiers stored in DB).
export const TEAMS = [
  // Hosts
  { code: 'CAN', name: 'Canada', flag: 'CA' },
  { code: 'MEX', name: 'Mexico', flag: 'MX' },
  { code: 'USA', name: 'United States', flag: 'US' },
  // Other 45 qualified teams (alphabetical)
  { code: 'ALG', name: 'Algeria', flag: 'DZ' },
  { code: 'ARG', name: 'Argentina', flag: 'AR' },
  { code: 'AUS', name: 'Australia', flag: 'AU' },
  { code: 'AUT', name: 'Austria', flag: 'AT' },
  { code: 'BEL', name: 'Belgium', flag: 'BE' },
  { code: 'BIH', name: 'Bosnia and Herzegovina', flag: 'BA' },
  { code: 'BRA', name: 'Brazil', flag: 'BR' },
  { code: 'CPV', name: 'Cabo Verde', flag: 'CV' },
  { code: 'COL', name: 'Colombia', flag: 'CO' },
  { code: 'COD', name: 'Congo DR', flag: 'CD' },
  { code: 'CIV', name: "Côte d'Ivoire", flag: 'CI' },
  { code: 'CRO', name: 'Croatia', flag: 'HR' },
  { code: 'CUW', name: 'Curaçao', flag: 'CW' },
  { code: 'CZE', name: 'Czechia', flag: 'CZ' },
  { code: 'ECU', name: 'Ecuador', flag: 'EC' },
  { code: 'EGY', name: 'Egypt', flag: 'EG' },
  { code: 'ENG', name: 'England', flag: 'ENG' },
  { code: 'FRA', name: 'France', flag: 'FR' },
  { code: 'GER', name: 'Germany', flag: 'DE' },
  { code: 'GHA', name: 'Ghana', flag: 'GH' },
  { code: 'HAI', name: 'Haiti', flag: 'HT' },
  { code: 'IRN', name: 'IR Iran', flag: 'IR' },
  { code: 'IRQ', name: 'Iraq', flag: 'IQ' },
  { code: 'JPN', name: 'Japan', flag: 'JP' },
  { code: 'JOR', name: 'Jordan', flag: 'JO' },
  { code: 'KOR', name: 'Korea Republic', flag: 'KR' },
  { code: 'MAR', name: 'Morocco', flag: 'MA' },
  { code: 'NED', name: 'Netherlands', flag: 'NL' },
  { code: 'NZL', name: 'New Zealand', flag: 'NZ' },
  { code: 'NOR', name: 'Norway', flag: 'NO' },
  { code: 'PAN', name: 'Panama', flag: 'PA' },
  { code: 'PAR', name: 'Paraguay', flag: 'PY' },
  { code: 'POR', name: 'Portugal', flag: 'PT' },
  { code: 'QAT', name: 'Qatar', flag: 'QA' },
  { code: 'KSA', name: 'Saudi Arabia', flag: 'SA' },
  { code: 'SCO', name: 'Scotland', flag: 'SCO' },
  { code: 'SEN', name: 'Senegal', flag: 'SN' },
  { code: 'RSA', name: 'South Africa', flag: 'ZA' },
  { code: 'ESP', name: 'Spain', flag: 'ES' },
  { code: 'SWE', name: 'Sweden', flag: 'SE' },
  { code: 'SUI', name: 'Switzerland', flag: 'CH' },
  { code: 'TUN', name: 'Tunisia', flag: 'TN' },
  { code: 'TUR', name: 'Türkiye', flag: 'TR' },
  { code: 'URU', name: 'Uruguay', flag: 'UY' },
  { code: 'UZB', name: 'Uzbekistan', flag: 'UZ' },
];

export const TEAM_BY_CODE = Object.fromEntries(TEAMS.map(t => [t.code, t]));

// 2026 World Cup groups — actual draw. Each list is in current standings order
// where known (group winners first), otherwise tournament-order.
export const GROUPS = [
  { label: 'A', teams: ['MEX', 'KOR', 'CZE', 'RSA'] },
  { label: 'B', teams: ['SUI', 'CAN', 'QAT', 'BIH'] },
  { label: 'C', teams: ['SCO', 'MAR', 'BRA', 'HAI'] },
  { label: 'D', teams: ['USA', 'AUS', 'TUR', 'PAR'] },
  { label: 'E', teams: ['GER', 'CIV', 'ECU', 'CUW'] },
  { label: 'F', teams: ['SWE', 'JPN', 'NED', 'TUN'] },
  { label: 'G', teams: ['BEL', 'EGY', 'IRN', 'NZL'] },
  { label: 'H', teams: ['ESP', 'CPV', 'KSA', 'URU'] },
  { label: 'I', teams: ['FRA', 'IRQ', 'NOR', 'SEN'] },
  { label: 'J', teams: ['ALG', 'ARG', 'AUT', 'JOR'] },
  { label: 'K', teams: ['COL', 'COD', 'POR', 'UZB'] },
  { label: 'L', teams: ['CRO', 'ENG', 'GHA', 'PAN'] },
];

// Maps each R32 match (1..16) to the group label whose teams can be picked
// in that slot. 12 groups × 1 R32 match each + 4 extra matches for the "best
// third-placed" qualifiers (assigned here to A/B/C/D as a default).
export const R32_GROUP_BY_MATCH = {
   1: 'A',  2: 'B',  3: 'C',  4: 'D',
   5: 'E',  6: 'F',  7: 'G',  8: 'H',
   9: 'I', 10: 'J', 11: 'K', 12: 'L',
  13: 'A', 14: 'B', 15: 'C', 16: 'D',
};

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
