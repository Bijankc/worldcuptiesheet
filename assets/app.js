import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { TEAMS, TEAM_BY_CODE, ROUND_OF, nextMatch, feederMatches } from './data.js';

const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.APP_CONFIG;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
const state = {
  user: null,           // Supabase auth user
  profile: null,        // { display_name, champion_country }
  matches: [],          // 31 match rows from DB
  predictions: {},      // { match_id: predicted_winner_code }
  closeAt: null,        // Date — predictions lockout
};

const isPredictionsOpen = () => state.closeAt && state.closeAt > new Date();

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
async function boot() {
  setupTabs();
  setupAuthArea();

  const { data: { session } } = await sb.auth.getSession();
  state.user = session?.user ?? null;

  sb.auth.onAuthStateChange(async (_event, sess) => {
    state.user = sess?.user ?? null;
    state.profile = null;
    state.predictions = {};
    await refreshAll();
  });

  await refreshAll();
}

async function refreshAll() {
  await Promise.all([loadSettings(), loadMatches(), loadProfile(), loadPredictions()]);
  if (state.profile?.champion_country) {
    await autoLockChampionPath(state.profile.champion_country);
  }
  renderAuthArea();
  renderLockoutBanner();
  await renderLeaderboard();
  renderBracket();
  if (state.user && state.profile === null) showChampionPopup();
}

// ---------------------------------------------------------------------------
// Data loaders
// ---------------------------------------------------------------------------
async function loadSettings() {
  const { data, error } = await sb.from('app_settings').select('*');
  if (error) return console.error(error);
  const row = data.find(r => r.key === 'predictions_close_at');
  state.closeAt = row ? new Date(row.value) : null;
}

async function loadMatches() {
  const { data, error } = await sb.from('matches').select('*').order('id');
  if (error) return console.error(error);
  state.matches = data;
}

async function loadProfile() {
  if (!state.user) { state.profile = null; return; }
  const { data, error } = await sb.from('profiles')
    .select('*').eq('id', state.user.id).maybeSingle();
  if (error) return console.error(error);
  state.profile = data; // null if first-time
}

async function loadPredictions() {
  if (!state.user) { state.predictions = {}; return; }
  const { data, error } = await sb.from('predictions')
    .select('*').eq('user_id', state.user.id);
  if (error) return console.error(error);
  state.predictions = Object.fromEntries(data.map(p => [p.match_id, p.predicted_winner]));
}

// ---------------------------------------------------------------------------
// Auth UI
// ---------------------------------------------------------------------------
function setupAuthArea() { /* re-rendered each refresh */ }

function renderAuthArea() {
  const el = document.getElementById('auth-area');
  if (state.user) {
    const name = state.profile?.display_name ?? state.user.email;
    el.innerHTML = `<span class="muted" style="margin-left:8px;">${escape(name)}</span>
      <button class="secondary" id="signout-btn" style="margin-left:8px;">Sign out</button>`;
    document.getElementById('signout-btn').onclick = async () => {
      await sb.auth.signOut();
    };
  } else {
    el.innerHTML = `<button id="signin-btn">Sign in with Google</button>`;
    document.getElementById('signin-btn').onclick = async () => {
      await sb.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + window.location.pathname },
      });
    };
  }
}

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------
function setupTabs() {
  document.querySelectorAll('[data-tab]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = link.dataset.tab;
      document.querySelectorAll('[data-tab]').forEach(a => a.classList.toggle('active', a === link));
      document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
      document.getElementById(`view-${tab}`).classList.remove('hidden');
    });
  });
}

// ---------------------------------------------------------------------------
// Champion popup
// ---------------------------------------------------------------------------
function showChampionPopup() {
  const root = document.getElementById('modal-root');
  let chosen = null;
  let displayName = state.user.user_metadata?.full_name
    || state.user.user_metadata?.name
    || state.user.email?.split('@')[0]
    || '';

  function render() {
    root.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal">
          <h2>Welcome!</h2>
          <p class="muted">Pick your name and the country you think will win the World Cup.
          Your champion will be locked into your bracket all the way to the final.</p>
          <label class="muted" style="font-size:12px;">Display name</label>
          <input type="text" id="champ-name" value="${escape(displayName)}" />
          <label class="muted" style="font-size:12px; display:block; margin-top:12px;">Champion country</label>
          <div class="country-grid">
            ${TEAMS.map(t => `
              <button data-code="${t.code}" class="${chosen === t.code ? 'selected' : ''}">
                <span class="flag">${t.flag}</span>${escape(t.name)}
              </button>`).join('')}
          </div>
          <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:12px;">
            <button class="secondary" id="cancel-champ">Cancel</button>
            <button id="save-champ" ${chosen ? '' : 'disabled'}>Save</button>
          </div>
        </div>
      </div>`;

    root.querySelectorAll('.country-grid button').forEach(b => {
      b.onclick = () => { chosen = b.dataset.code; render(); };
    });
    document.getElementById('champ-name').oninput = (e) => { displayName = e.target.value; };
    document.getElementById('cancel-champ').onclick = () => { root.innerHTML = ''; };
    document.getElementById('save-champ').onclick = async () => {
      if (!chosen || !displayName.trim()) return;
      const { error } = await sb.from('profiles').insert({
        id: state.user.id,
        display_name: displayName.trim(),
        champion_country: chosen,
      });
      if (error) return toast(error.message, 'error');
      await loadProfile();
      // Lock in: champion wins every match it's in, all the way to the Final.
      await autoLockChampionPath(chosen);
      await loadPredictions();
      root.innerHTML = '';
      renderAuthArea();
      renderBracket();
      await renderLeaderboard();
      toast('Champion saved', 'success');
    };
  }
  render();
}

// Try to auto-lock the champion's wins for any matches where they're already
// in the lineup. Safe to call multiple times — does nothing if predictions
// are closed or the champion isn't in any match yet.
async function autoLockChampionPath(code) {
  if (!isPredictionsOpen()) return;
  const championMatches = state.matches.filter(m =>
    m.team_home === code || m.team_away === code
  );
  for (const m of championMatches) {
    await upsertPrediction(m.id, code, { silent: true });
  }
}

// ---------------------------------------------------------------------------
// Leaderboard
// ---------------------------------------------------------------------------
async function renderLeaderboard() {
  const container = document.getElementById('leaderboard-container');
  const { data, error } = await sb.rpc('get_leaderboard');
  if (error) {
    container.innerHTML = `<p class="muted">Could not load leaderboard.</p>`;
    return;
  }
  if (!data || data.length === 0) {
    container.innerHTML = `<p class="muted">No players yet. Be the first to sign in.</p>`;
    return;
  }
  container.innerHTML = `
    <table class="leaderboard">
      <thead><tr><th>#</th><th>Player</th><th>Champion</th><th style="text-align:right;">Points</th></tr></thead>
      <tbody>
        ${data.map((row, i) => {
          const champ = TEAM_BY_CODE[row.champion_country];
          const isMe = state.user && row.user_id === state.user.id;
          return `<tr class="${isMe ? 'me' : ''}">
            <td class="rank">${i + 1}</td>
            <td>${escape(row.display_name)}</td>
            <td>${champ ? `<span class="flag">${champ.flag}</span>${escape(champ.name)}` : '—'}</td>
            <td class="pts">${row.points}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
}

function renderLockoutBanner() {
  const el = document.getElementById('lockout-banner');
  if (!state.closeAt) { el.textContent = ''; return; }
  if (isPredictionsOpen()) {
    el.textContent = `Predictions are open until ${state.closeAt.toLocaleString()}.`;
  } else {
    el.textContent = `Predictions are locked. Tournament in progress.`;
  }
}

// ---------------------------------------------------------------------------
// Bracket
// ---------------------------------------------------------------------------
function renderBracket() {
  const container = document.getElementById('bracket-container');
  if (!state.user) {
    container.innerHTML = `<p class="muted">Sign in with Google to fill in your bracket.</p>`;
    return;
  }
  if (!state.profile) {
    container.innerHTML = `<p class="muted">Pick your champion to start.</p>`;
    return;
  }

  const columns = [
    { round: 'R32', label: 'Round of 32' },
    { round: 'R16', label: 'Round of 16' },
    { round: 'QF',  label: 'Quarter-finals' },
    { round: 'SF',  label: 'Semi-finals' },
    { round: 'F',   label: 'Final' },
  ];

  container.innerHTML = `<div class="bracket">${columns.map(col => `
    <div class="bracket-col">
      <h3>${col.label}</h3>
      <div class="matches">
        ${state.matches.filter(m => m.round === col.round).map(m => matchHtml(m)).join('')}
      </div>
    </div>`).join('')}</div>`;

  // Wire up clicks
  container.querySelectorAll('[data-pick]').forEach(el => {
    el.addEventListener('click', () => {
      const matchId = +el.dataset.match;
      const team = el.dataset.pick;
      onPickWinner(matchId, team);
    });
  });
}

function matchHtml(m) {
  const home = teamInSlot(m, 'home');
  const away = teamInSlot(m, 'away');
  const predicted = state.predictions[m.id];
  const champ = state.profile?.champion_country;
  const lockedByChamp = champ && (home === champ || away === champ);
  const open = isPredictionsOpen() && !lockedByChamp;
  const hasResult = !!m.winner;

  const slotClass = (code) => {
    if (!code) return 'team-slot tbd';
    const sel = predicted === code;
    const cls = ['team-slot'];
    if (sel) cls.push('selected');
    if (hasResult && m.winner === code) cls.push('actual-winner');
    if (!open) cls.push('locked');
    return cls.join(' ');
  };

  const matchClass = (() => {
    if (!hasResult || !predicted) return '';
    return predicted === m.winner ? 'correct' : 'wrong';
  })();

  const slotHtml = (code, side) => {
    if (!code) {
      return `<div class="team-slot tbd"><span class="name">${side === 'home' ? 'TBD' : 'TBD'}</span></div>`;
    }
    const t = TEAM_BY_CODE[code] || { name: code, flag: '?' };
    const attrs = open ? `data-pick="${code}" data-match="${m.id}"` : '';
    return `<div class="${slotClass(code)}" ${attrs}>
      <span class="name"><span class="flag">${t.flag}</span>${escape(t.name)}</span>
    </div>`;
  };

  return `<div class="match ${matchClass} ${lockedByChamp ? 'champion-locked' : ''}">
    ${slotHtml(home, 'home')}
    ${slotHtml(away, 'away')}
  </div>`;
}

// Pick a team to fill a slot in match m. Lineup priorities:
//   1. Actual team set by admin (m.team_home / m.team_away)
//   2. User's predicted winner of the feeder match
function teamInSlot(m, side) {
  const dbVal = side === 'home' ? m.team_home : m.team_away;
  if (dbVal) return dbVal;
  const feeders = feederMatches(m.id);
  if (!feeders) return null;
  const feederId = side === 'home' ? feeders[0] : feeders[1];
  return state.predictions[feederId] ?? null;
}

async function onPickWinner(matchId, code) {
  await upsertPrediction(matchId, code);
  // Cascade: any downstream prediction that no longer matches the path is cleared.
  cascadeClearStalePredictions(matchId, code);
  renderBracket();
  await renderLeaderboard();
}

function cascadeClearStalePredictions(matchId, newWinner) {
  // If user already had a prediction in a downstream match that depended on
  // a different team winning matchId, clear it. (We only re-pick automatically
  // for the champion lock; everything else is left for the user to update.)
  let current = matchId;
  while (true) {
    const next = nextMatch(current);
    if (!next) break;
    const downstream = state.matches.find(m => m.id === next.id);
    if (!downstream) break;
    const downstreamPick = state.predictions[next.id];
    if (downstreamPick && downstreamPick !== newWinner) {
      // Only clear if the pick was the previous feeder winner (i.e. it became
      // impossible). Heuristic: if downstreamPick isn't one of the now-valid
      // sides of the downstream match, drop it.
      const home = teamInSlot(downstream, 'home');
      const away = teamInSlot(downstream, 'away');
      if (downstreamPick !== home && downstreamPick !== away) {
        sb.from('predictions').delete()
          .eq('user_id', state.user.id).eq('match_id', next.id).then(() => {});
        delete state.predictions[next.id];
      }
    }
    current = next.id;
  }
}

async function upsertPrediction(matchId, code, opts = {}) {
  state.predictions[matchId] = code;
  const { error } = await sb.from('predictions').upsert({
    user_id: state.user.id,
    match_id: matchId,
    predicted_winner: code,
    updated_at: new Date().toISOString(),
  });
  if (error && !opts.silent) toast(error.message, 'error');
}

// ---------------------------------------------------------------------------
// Utils
// ---------------------------------------------------------------------------
function escape(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function toast(msg, kind = '') {
  const root = document.getElementById('toast-root');
  const el = document.createElement('div');
  el.className = `toast ${kind}`;
  el.textContent = msg;
  root.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

boot();
