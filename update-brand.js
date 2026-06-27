const fs = require('fs');
const path = require('path');
const base = __dirname;

// ---- 1. UPDATE SIDEBAR LOGO ----
const sidebarPath = path.join(base, 'components', 'sidebar.tsx');
let sidebar = fs.readFileSync(sidebarPath, 'utf8');

// Find and replace the brand block
const brandStart = sidebar.indexOf('{/* Brand */}');
const navStart = sidebar.indexOf('{/* Nav */}');

if (brandStart === -1 || navStart === -1) {
  console.error('Could not find brand or nav markers in sidebar.tsx');
  process.exit(1);
}

const newBrand = [
  '      {/* Brand */}',
  '      <div className="px-4 py-5 shrink-0" style={{ borderBottom: \'1px solid #1e2030\' }}>',
  '        <div className="flex items-center gap-3">',
  '          {/* Logo mark - hexagonal emblem */}',
  '          <div className="shrink-0 relative" style={{ width: 36, height: 36 }}>',
  '            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 36, height: 36, filter: \'drop-shadow(0 0 6px #00f0ff88)\' }}>',
  '              <defs>',
  '                <linearGradient id="gm-grad" x1="0" y1="0" x2="1" y2="1">',
  '                  <stop offset="0%" stopColor="#00f0ff"/>',
  '                  <stop offset="100%" stopColor="#7000ff"/>',
  '                </linearGradient>',
  '              </defs>',
  '              {/* Hexagon outer */}',
  '              <path d="M18 2L33 10.5V25.5L18 34L3 25.5V10.5L18 2Z" stroke="url(#gm-grad)" strokeWidth="1.5" fill="rgba(0,240,255,0.05)"/>',
  '              {/* Power circle */}',
  '              <circle cx="18" cy="15" r="5" stroke="url(#gm-grad)" strokeWidth="1.2" fill="none"/>',
  '              <line x1="18" y1="10" x2="18" y2="13" stroke="url(#gm-grad)" strokeWidth="1.5" strokeLinecap="round"/>',
  '              {/* Up arrow */}',
  '              <path d="M23 10L27 6M27 6H23M27 6V10" stroke="#00f0ff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>',
  '              {/* Circular arrows hint */}',
  '              <path d="M12 21C12 24.3 14.7 27 18 27S24 24.3 24 21" stroke="url(#gm-grad)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>',
  '            </svg>',
  '          </div>',
  '          <div className="min-w-0">',
  '            <p',
  '              className="text-sm font-black tracking-[0.15em] uppercase leading-none"',
  '              style={{ color: \'#ffffff\', letterSpacing: \'0.15em\', textShadow: \'0 0 12px rgba(0,240,255,0.4)\' }}',
  '            >',
  '              GODMODE',
  '            </p>',
  '            <p',
  '              className="text-[8px] tracking-[0.2em] uppercase mt-0.5"',
  '              style={{ color: \'#00f0ff\', opacity: 0.7 }}',
  '            >',
  '              CAREER ACCELERATOR',
  '            </p>',
  '          </div>',
  '        </div>',
  '      </div>'
].join('\n');

const beforeBrand = sidebar.slice(0, brandStart);
const afterNav = sidebar.slice(navStart);
sidebar = beforeBrand + newBrand + '\n\n      ' + afterNav;
fs.writeFileSync(sidebarPath, sidebar);
console.log('✓ sidebar.tsx brand updated');

// ---- 2. UPDATE GLOBAL BACKGROUND COLOR ----
const shellPath = path.join(base, 'components', 'app-shell.tsx');
let shell = fs.readFileSync(shellPath, 'utf8');
shell = shell.replace("background: '#0b0c10'", "background: '#0d0e18'");
fs.writeFileSync(shellPath, shell);
console.log('✓ app-shell.tsx background updated');

// ---- 3. UPDATE SIDEBAR BACKGROUND ----
sidebar = fs.readFileSync(sidebarPath, 'utf8');
sidebar = sidebar.replace("background: '#0b0c10', borderRight", "background: '#090a12', borderRight");
fs.writeFileSync(sidebarPath, sidebar);
console.log('✓ sidebar background updated');

// ---- 4. UPDATE CHAT PANEL HEADER BRANDING ----
const chatPath = path.join(base, 'components', 'chat-panel.tsx');
let chat = fs.readFileSync(chatPath, 'utf8');
// Replace the Zap icon box with the gradient G logo mark
const oldChatLogo = `<div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#00f0ff,#7000ff)' }}>`;
const newChatLogo = `<div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#00f0ff 0%,#7000ff 100%)', boxShadow: '0 0 8px rgba(0,240,255,0.4)' }}>`;
chat = chat.replace(oldChatLogo, newChatLogo);
// Update career assistant label styling
chat = chat.replace(
  'className="text-xs font-semibold tracking-wide" style={{ color: \'#fff\' }}>Career Assistant',
  'className="text-xs font-bold tracking-[0.1em] uppercase" style={{ color: \'#fff\', textShadow: \'0 0 8px rgba(0,240,255,0.3)\' }}>GODMODE AI'
);
fs.writeFileSync(chatPath, chat);
console.log('✓ chat-panel.tsx branding updated');

console.log('');
console.log('✅ All branding updates applied! Check your browser.');