import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { TEAMS, TEAM_BY_CODE, ROUND_OF } from './data.js';

const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.APP_CONFIG;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SESSION_KEY = 'wctip_admin_pw';

const state = {
  password: sessionStorage.getItem(SESSION_KEY) || null,
  matches: [],
  closeAt: null,
};

async function boot() {
  document.getElementById('login-form').addEventListener('submit', onLogin);
  if (state.password) await tryEnterAdmin();
}

async function onLogin(e) {
  e.preventDefault();
  const pw = document.getElementById('admin-password').value;
  const ok = await verifyPassword(pw);
  if (!ok) return toast('Wrong password', 'error');
  state.password = pw;
  sessionStorage.setItem(SESSION_KEY, pw);
  await tryEnterAdmin();
}

async function verifyPassword(pw) {
  try {
    const r = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    });
    return r.ok;
  } catch { return false; }
}

async function tryEnterAdmin() {
  const ok = await verifyPassword(state.password);
  if (!ok) {
    sessionStorage.removeItem(SESSION_KEY);
    state.password = null;
    return;
  }
  document.getElementById('login-view').classList.add('hidden');
  document.getElementById('admin-view').classList.remove('hidden');
  await loadAll();
  render();
}

async function loadAll() {
  const [{ data: matches }, { data: settings }] = await Promise.all([
    sb.from('matches').select('*').order('id'),
    sb.from('app_settings').select('*'),
  ]);
  state.matches = matches || [];
  const row = (settings || []).find(r => r.key === 'predictions_close_at');
  state.closeAt = row?.value || '';
}

function render() {
  renderMatches();
  document.getElementById('lockout-input').value = state.closeAt || '';
  document.getElementById('save-lockout').onclick = onSaveLockout;
}

function renderMatches() {
  const container = document.getElementById('admin-matches');
  container.innerHTML = state.matches.map(m => matchCard(m)).join('');
  container.querySelectorAll('select[data-field]').forEach(sel => {
    sel.addEventListener('change', () => onMatchChange(sel));
  });
}

function matchCard(m) {
  const round = ROUND_OF(m.id);
  const winnerOpts = (() => {
    const arr = [`<option value="">— not played —</option>`];
    for (const t of TEAMS) {
      arr.push(`<option value="${t.code}" ${m.winner === t.code ? 'selected' : ''}>${escape(t.name)}</option>`);
    }
    return arr.join('');
  })();

  return `<div class="admin-match" data-match="${m.id}">
    <h4>${round} · Match ${m.id}</h4>
    <div class="row"><label>Actual winner</label></div>
    <select data-match="${m.id}" data-field="winner">${winnerOpts}</select>
  </div>`;
}

async function onMatchChange(sel) {
  const id = +sel.dataset.match;
  const value = sel.value || null;
  const m = state.matches.find(x => x.id === id);
  m.winner = value;
  const r = await fetch('/api/admin/match', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      password: state.password,
      id, winner: m.winner,
    }),
  });
  if (!r.ok) {
    toast('Could not save match', 'error');
    return;
  }
  toast('Saved', 'success');
}

async function onSaveLockout() {
  const value = document.getElementById('lockout-input').value.trim();
  if (!value) return;
  const r = await fetch('/api/admin/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      password: state.password,
      key: 'predictions_close_at', value,
    }),
  });
  if (!r.ok) return toast('Could not save', 'error');
  state.closeAt = value;
  toast('Saved', 'success');
}

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
