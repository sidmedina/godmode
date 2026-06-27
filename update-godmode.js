const fs = require('fs');
const path = require('path');

// ---- UPDATE types.ts ----
const typesPath = path.join(__dirname, 'lib', 'types.ts');
let types = fs.readFileSync(typesPath, 'utf8');
const oldTypesEnd = '  coverLetter?: string;\n}';
const newTypesEnd = [
  '  coverLetter?: string;',
  '  // Contact info',
  '  hrManagerName?: string;',
  '  hrManagerEmail?: string;',
  '  hiringManagerName?: string;',
  '  hiringManagerEmail?: string;',
  '  // Job details',
  '  companyAddress?: string;',
  '  postedDate?: string;',
  '  workType?: string;',
  '  salaryPosted?: string;',
  '  // Documents',
  '  cvText?: string;',
  '  coverLetterText?: string;',
  '}'
].join('\n');
if (!types.includes('hrManagerName')) {
  types = types.replace(oldTypesEnd, newTypesEnd);
  fs.writeFileSync(typesPath, types);
  console.log('✓ types.ts updated');
} else {
  console.log('✓ types.ts already up to date');
}

// ---- UPDATE job-detail-modal.tsx ----
const modalPath = path.join(__dirname, 'components', 'job-detail-modal.tsx');
let modal = fs.readFileSync(modalPath, 'utf8');
const lines = modal.split('\n');

// Find the line indexes
let detailsStart = -1, prepStart = -1;
lines.forEach((l, i) => {
  if (l.includes('DETAILS TAB')) detailsStart = i;
  if (l.includes('INTERVIEW PREP TAB') && prepStart === -1) prepStart = i;
});

if (detailsStart === -1 || prepStart === -1) {
  console.error('Could not find tab markers in modal file');
  process.exit(1);
}

// Build the new details tab block
const newBlock = [
  '          {/* DETAILS TAB */}',
  '          {tab === \'details\' && (',
  '            <div className="p-6 space-y-6">',
  '',
  '              {/* JOB INFO */}',
  '              <div>',
  '                <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: \'#555\' }}>Job Information</p>',
  '                <div className="grid grid-cols-2 gap-3">',
  '                  <div className="rounded-lg p-3" style={{ background: \'#0b0c10\', border: \'1px solid #222530\' }}>',
  '                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: \'#444\' }}>Posted Date</p>',
  '                    <input defaultValue={job.postedDate ?? \'\'} placeholder="e.g. 2026-05-01" className="w-full bg-transparent text-xs outline-none" style={{ color: \'#b0b3b8\' }} />',
  '                  </div>',
  '                  <div className="rounded-lg p-3" style={{ background: \'#0b0c10\', border: \'1px solid #222530\' }}>',
  '                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: \'#444\' }}>Work Type</p>',
  '                    <input defaultValue={job.workType ?? \'\'} placeholder="Remote / Hybrid / On-site" className="w-full bg-transparent text-xs outline-none" style={{ color: \'#b0b3b8\' }} />',
  '                  </div>',
  '                  <div className="rounded-lg p-3" style={{ background: \'#0b0c10\', border: \'1px solid #222530\' }}>',
  '                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: \'#444\' }}>Salary Posted</p>',
  '                    <input defaultValue={job.salaryPosted ?? \'\'} placeholder="e.g. $120k–$150k" className="w-full bg-transparent text-xs outline-none" style={{ color: \'#b0b3b8\' }} />',
  '                  </div>',
  '                  <div className="rounded-lg p-3" style={{ background: \'#0b0c10\', border: \'1px solid #222530\' }}>',
  '                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: \'#444\' }}>Company Address</p>',
  '                    <input defaultValue={job.companyAddress ?? \'\'} placeholder="City, Country" className="w-full bg-transparent text-xs outline-none" style={{ color: \'#b0b3b8\' }} />',
  '                  </div>',
  '                </div>',
  '                {job.url && (',
  '                  <div className="mt-3">',
  '                    <a href={job.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs" style={{ color: \'#00f0ff\' }}>',
  '                      <ExternalLink size={12} /> Open original posting',
  '                    </a>',
  '                  </div>',
  '                )}',
  '              </div>',
  '',
  '              {/* CONTACTS */}',
  '              <div style={{ borderTop: \'1px solid #222530\', paddingTop: \'20px\' }}>',
  '                <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: \'#555\' }}>Contacts</p>',
  '                <div className="grid grid-cols-2 gap-3">',
  '                  <div className="rounded-lg p-3" style={{ background: \'#0b0c10\', border: \'1px solid #222530\' }}>',
  '                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: \'#444\' }}>HR Manager Name</p>',
  '                    <input defaultValue={job.hrManagerName ?? \'\'} placeholder="Full name" className="w-full bg-transparent text-xs outline-none" style={{ color: \'#b0b3b8\' }} />',
  '                  </div>',
  '                  <div className="rounded-lg p-3" style={{ background: \'#0b0c10\', border: \'1px solid #222530\' }}>',
  '                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: \'#444\' }}>HR Manager Email</p>',
  '                    <input defaultValue={job.hrManagerEmail ?? \'\'} placeholder="hr@company.com" className="w-full bg-transparent text-xs outline-none" style={{ color: \'#b0b3b8\' }} />',
  '                  </div>',
  '                  <div className="rounded-lg p-3" style={{ background: \'#0b0c10\', border: \'1px solid #222530\' }}>',
  '                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: \'#444\' }}>Hiring Manager Name</p>',
  '                    <input defaultValue={job.hiringManagerName ?? \'\'} placeholder="Full name" className="w-full bg-transparent text-xs outline-none" style={{ color: \'#b0b3b8\' }} />',
  '                  </div>',
  '                  <div className="rounded-lg p-3" style={{ background: \'#0b0c10\', border: \'1px solid #222530\' }}>',
  '                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: \'#444\' }}>Hiring Manager Email</p>',
  '                    <input defaultValue={job.hiringManagerEmail ?? \'\'} placeholder="manager@company.com" className="w-full bg-transparent text-xs outline-none" style={{ color: \'#b0b3b8\' }} />',
  '                  </div>',
  '                </div>',
  '              </div>',
  '',
  '              {/* NOTES */}',
  '              {job.notes && (',
  '                <div style={{ borderTop: \'1px solid #222530\', paddingTop: \'20px\' }}>',
  '                  <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: \'#555\' }}>Notes</p>',
  '                  <p className="text-sm leading-relaxed" style={{ color: \'#b0b3b8\' }}>{job.notes}</p>',
  '                </div>',
  '              )}',
  '',
  '              {/* CV */}',
  '              <div style={{ borderTop: \'1px solid #222530\', paddingTop: \'20px\' }}>',
  '                <div className="flex items-center justify-between mb-3">',
  '                  <div>',
  '                    <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: \'#555\' }}>CV</p>',
  '                    <p className="text-[10px] mt-0.5" style={{ color: \'#444\' }}>Paste your tailored CV here</p>',
  '                  </div>',
  '                  <a href="vscode://file/C:/Users/sidme/Documents/career-ops" className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-md" style={{ background: \'#1a1d28\', color: \'#00f0ff\', border: \'1px solid #00f0ff33\' }}>',
  '                    <FileText size={11} /> Open CareerOps',
  '                  </a>',
  '                </div>',
  '                <textarea',
  '                  defaultValue={job.cvText ?? \'\'}',
  '                  placeholder="Paste your tailored CV here..."',
  '                  rows={6}',
  '                  className="w-full resize-none rounded-lg px-4 py-3 text-xs leading-relaxed outline-none font-mono"',
  '                  style={{ background: \'#0b0c10\', color: \'#b0b3b8\', border: \'1px solid #222530\' }}',
  '                />',
  '              </div>',
  '',
  '              {/* COVER LETTER */}',
  '              <div style={{ borderTop: \'1px solid #222530\', paddingTop: \'20px\' }}>',
  '                <div className="flex items-center justify-between mb-3">',
  '                  <div>',
  '                    <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: \'#555\' }}>Cover Letter</p>',
  '                    <p className="text-[10px] mt-0.5" style={{ color: \'#444\' }}>Paste your tailored cover letter here</p>',
  '                  </div>',
  '                </div>',
  '                <textarea',
  '                  value={coverLetter}',
  '                  onChange={(e) => setCoverLetter(e.target.value)}',
  '                  placeholder="Paste your tailored cover letter here..."',
  '                  rows={6}',
  '                  className="w-full resize-none rounded-lg px-4 py-3 text-xs leading-relaxed outline-none font-mono"',
  '                  style={{ background: \'#0b0c10\', color: \'#b0b3b8\', border: \'1px solid #222530\' }}',
  '                />',
  '              </div>',
  '',
  '            </div>',
  '          )}'
].join('\n');

// Splice in the new block
const before = lines.slice(0, detailsStart).join('\n');
const after = lines.slice(prepStart).join('\n');
const newModal = before + '\n' + newBlock + '\n\n' + after;
fs.writeFileSync(modalPath, newModal);
console.log('✓ job-detail-modal.tsx updated');
console.log('Done! Check your browser — it should auto-reload.');