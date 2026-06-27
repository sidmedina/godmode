/**
 * GodMode sync watcher — runs in the background.
 * Watches career-ops/data/applications.md for changes and auto-pushes to Netlify.
 *
 * Start: node watch-and-sync.mjs
 * Stop:  Ctrl+C  (or close the terminal)
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CAREER_OPS_PATH =
  process.env.CAREER_OPS_PATH ||
  path.join('C:', 'Users', process.env.USERNAME || 'sidme', 'Documents', 'career-ops');

const WATCH_FILES = [
  path.join(CAREER_OPS_PATH, 'data', 'applications.md'),
  path.join(CAREER_OPS_PATH, 'data', 'pipeline.md'),
];

const GODMODE_PATH = __dirname;
const DEBOUNCE_MS = 4000; // wait 4s after last change before syncing

let debounceTimer = null;
let lastSyncHash = '';

function log(msg) {
  const time = new Date().toLocaleTimeString('en-US', { hour12: false });
  console.log(`[${time}] ${msg}`);
}

function getHash() {
  return WATCH_FILES.map((f) => {
    try { return fs.statSync(f).mtimeMs; } catch { return 0; }
  }).join('-');
}

function sync() {
  const currentHash = getHash();
  if (currentHash === lastSyncHash) {
    log('No changes detected — skipping sync.');
    return;
  }

  log('Change detected — exporting snapshot...');
  try {
    execSync(`node "${path.join(GODMODE_PATH, 'export-snapshot.mjs')}"`, { stdio: 'pipe' });
  } catch (e) {
    log(`Export failed: ${e.message}`);
    return;
  }

  log('Pushing to GitHub → Netlify...');
  try {
    execSync('git add data/snapshot.json', { cwd: GODMODE_PATH, stdio: 'pipe' });

    // Only commit if there's actually a change to snapshot.json
    const diff = execSync('git diff --cached --stat', { cwd: GODMODE_PATH }).toString().trim();
    if (!diff) {
      log('Snapshot unchanged — nothing to push.');
      lastSyncHash = currentHash;
      return;
    }

    execSync(
      `git commit -m "auto: refresh job data ${new Date().toISOString().slice(0, 10)}"`,
      { cwd: GODMODE_PATH, stdio: 'pipe' }
    );
    execSync('git push', { cwd: GODMODE_PATH, stdio: 'pipe' });
    lastSyncHash = currentHash;
    log('✅ Done! Netlify is rebuilding — live in ~60 seconds.');
  } catch (e) {
    log(`Git push failed: ${e.message}`);
  }
}

function scheduleSync() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(sync, DEBOUNCE_MS);
}

// Watch each file (and its parent dir so we catch file creation too)
const watchedDirs = new Set(WATCH_FILES.map((f) => path.dirname(f)));
watchedDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    log(`Warning: ${dir} does not exist yet — will watch when created`);
    return;
  }
  fs.watch(dir, (eventType, filename) => {
    if (filename && WATCH_FILES.some((f) => f.endsWith(filename))) {
      log(`File changed: ${filename}`);
      scheduleSync();
    }
  });
  log(`Watching: ${dir}`);
});

lastSyncHash = getHash();
log('GodMode sync watcher is running. Press Ctrl+C to stop.');
log(`Watching for changes in career-ops/data/...`);
