const fs = require('fs');
const path = require('path');

// ── Paths ──────────────────────────────────────────────────────────────
const sidebarPath = path.join(__dirname, 'components', 'sidebar.tsx');

// ── Read current file ──────────────────────────────────────────────────
let sidebar = fs.readFileSync(sidebarPath, 'utf8');

// ── New SVG logo that matches the brand manual ─────────────────────────
// The brand shows: hexagonal emblem with power button + circular arrows +
// diagonal upward arrow, all in cyan-to-purple gradient with neon glow

const newLogoBlock = `          {/* Logo mark - GodMode brand emblem */}
          <div className="shrink-0 relative" style={{ width: 40, height: 40 }}>
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"
              style={{ width: 40, height: 40, filter: 'drop-shadow(0 0 8px #00c8ff) drop-shadow(0 0 16px #7000ff66)' }}>
              <defs>
                <linearGradient id="gm-main" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#00e5ff"/>
                  <stop offset="50%" stopColor="#4080ff"/>
                  <stop offset="100%" stopColor="#7c3aed"/>
                </linearGradient>
                <linearGradient id="gm-arrow" x1="0" y1="1" x2="1" y2="0">
                  <stop offset="0%" stopColor="#00e5ff"/>
                  <stop offset="100%" stopColor="#a78bfa"/>
                </linearGradient>
              </defs>
              {/* Outer hexagon - flat-top orientation */}
              <path d="M50 4 L93 27.5 L93 72.5 L50 96 L7 72.5 L7 27.5 Z"
                stroke="url(#gm-main)" strokeWidth="3" fill="rgba(0,200,255,0.06)"
                strokeLinejoin="round"/>
              {/* Inner hexagon decorative ring */}
              <path d="M50 14 L83 31.5 L83 68.5 L50 86 L17 68.5 L17 31.5 Z"
                stroke="url(#gm-main)" strokeWidth="1" fill="none" opacity="0.3"/>
              {/* Power button circle */}
              <circle cx="44" cy="48" r="14" stroke="url(#gm-main)" strokeWidth="2.5" fill="none"/>
              {/* Power button top gap + stem */}
              <path d="M44 34 L44 42" stroke="url(#gm-main)" strokeWidth="3" strokeLinecap="round"/>
              {/* Left circular arrow arc */}
              <path d="M32 55 A18 18 0 0 1 44 30" stroke="url(#gm-main)" strokeWidth="2.5"
                fill="none" strokeLinecap="round"/>
              {/* Left arrowhead */}
              <path d="M28 52 L32 56 L36 51" stroke="#00e5ff" strokeWidth="2"
                fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              {/* Right circular arrow arc */}
              <path d="M56 55 A18 18 0 0 0 44 30" stroke="url(#gm-main)" strokeWidth="2.5"
                fill="none" strokeLinecap="round"/>
              {/* Right arrowhead */}
              <path d="M60 52 L56 56 L52 51" stroke="#7c3aed" strokeWidth="2"
                fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              {/* Diagonal upward arrow - top right */}
              <path d="M60 22 L78 8" stroke="url(#gm-arrow)" strokeWidth="3" strokeLinecap="round"/>
              {/* Arrow head */}
              <path d="M72 6 L79 7 L78 14" stroke="url(#gm-arrow)" strokeWidth="2.5"
                fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              {/* Small circuit dots */}
              <circle cx="17" cy="50" r="2" fill="#00e5ff" opacity="0.6"/>
              <circle cx="83" cy="50" r="2" fill="#7c3aed" opacity="0.6"/>
            </svg>
          </div>`;

// ── Replace the old logo block ─────────────────────────────────────────
// Find from the {/* Logo mark */ comment to the closing </div>
const logoStart = sidebar.indexOf('{/* Logo mark');
const logoEnd = sidebar.indexOf('</div>', logoStart) + 6;

if (logoStart === -1) {
  console.log('ERROR: Could not find logo block. Looking for alternative markers...');
  // Try finding by SVG
  const svgStart = sidebar.indexOf('<div className="shrink-0 relative"');
  if (svgStart === -1) {
    console.log('FATAL: Cannot find logo block in sidebar.tsx');
    process.exit(1);
  }
  console.log('Found logo via shrink-0 relative at pos', svgStart);
}

const before = sidebar.slice(0, logoStart);
const after = sidebar.slice(logoEnd);
sidebar = before + newLogoBlock + after;

// ── Write updated file ─────────────────────────────────────────────────
fs.writeFileSync(sidebarPath, sidebar, 'utf8');
console.log('SUCCESS: sidebar.tsx updated with new brand logo!');
console.log('The app will hot-reload automatically.');
