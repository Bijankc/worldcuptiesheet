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

// Actual 2026 R32 fixtures from FIFA. Each entry lists the group positions of
// the two teams in that match — e.g. '2A' = runner-up of Group A,
// '3ABCDF' = best third-placed from one of Groups A/B/C/D/F.
// Source groups (the union of group letters mentioned in home + away) drives
// which teams the user can pick in that R32 slot.
export const R32_FIXTURES = {
   1: { home: '2A',     away: '2B' },         // M73
   2: { home: '1E',     away: '3ABCDF' },     // M74
   3: { home: '1F',     away: '2C' },         // M75
   4: { home: '1C',     away: '2F' },         // M76
   5: { home: '1I',     away: '3CDFGH' },     // M77
   6: { home: '2E',     away: '2I' },         // M78
   7: { home: '1A',     away: '3CEFHI' },     // M79
   8: { home: '1L',     away: '3EHIJK' },     // M80
   9: { home: '1D',     away: '3BEFIJ' },     // M81
  10: { home: '1G',     away: '3AEHIJ' },     // M82
  11: { home: '2K',     away: '2L' },         // M83
  12: { home: '1H',     away: '2J' },         // M84
  13: { home: '1B',     away: '3EFGIJ' },     // M85
  14: { home: '1J',     away: '2H' },         // M86
  15: { home: '1K',     away: '3DEIJL' },     // M87
  16: { home: '2D',     away: '2G' },         // M88
};

// Set of group letters that could feed each R32 match (derived from fixtures).
function groupsFor(slotLabel) {
  // Strip the leading rank digit ('1', '2', or '3') — the rest is group letters.
  return new Set(slotLabel.replace(/^\d/, '').split(''));
}
export const R32_SOURCE_GROUPS = Object.fromEntries(
  Object.entries(R32_FIXTURES).map(([id, fx]) => {
    const set = new Set([...groupsFor(fx.home), ...groupsFor(fx.away)]);
    return [+id, [...set].sort()];
  })
);

// Actual feeder edges from FIFA: which two earlier matches feed each match.
// Differs from the naive "consecutive pairs" rule, especially for R32→R16
// (M73+M75→R16#1, M74+M77→R16#2, …) and the QF #2/#3 swap.
export const MATCH_FEEDERS = {
  17: [2, 5],   // M89 = W74 vs W77
  18: [1, 3],   // M90 = W73 vs W75
  19: [4, 6],   // M91 = W76 vs W78
  20: [7, 8],   // M92 = W79 vs W80
  21: [11, 12], // M93 = W83 vs W84
  22: [9, 10],  // M94 = W81 vs W82
  23: [14, 16], // M95 = W86 vs W88
  24: [13, 15], // M96 = W85 vs W87
  25: [17, 18], // M97 = W89 vs W90
  26: [21, 22], // M98 = W93 vs W94
  27: [19, 20], // M99 = W91 vs W92
  28: [23, 24], // M100 = W95 vs W96
  29: [25, 26], // M101 = W97 vs W98
  30: [27, 28], // M102 = W99 vs W100
  31: [29, 30], // M104 = W101 vs W102
};

// Inverse of MATCH_FEEDERS — built once at module load.
export const NEXT_MATCH = (() => {
  const out = {};
  for (const [next, feeders] of Object.entries(MATCH_FEEDERS)) {
    out[feeders[0]] = { id: +next, slot: 'home' };
    out[feeders[1]] = { id: +next, slot: 'away' };
  }
  return out;
})();

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
export function nextMatch(id) {
  return NEXT_MATCH[id] || null;
}

// Which two earlier matches feed into `id`? Null for R32 (no feeders).
export function feederMatches(id) {
  return MATCH_FEEDERS[id] || null;
}
