// Fails if a published role version was edited, renamed or removed compared with the base branch.
// Published versions are a three-year record; change a role by adding a new dated file.
import { execSync } from 'node:child_process';

const base = process.env.ROLE_HISTORY_BASE || 'origin/main';
let out = '';
try {
  out = execSync(`git diff --name-status ${base}...HEAD -- content/roles`, { encoding: 'utf8' });
} catch {
  console.log(`check-role-history: base ${base} not found, nothing to compare.`);
  process.exit(0);
}
const bad = out
  .split('\n')
  .filter(Boolean)
  .filter((l) => /^(M|D|R)/.test(l) && /content\/roles\/[a-z]+\/\d{4}-\d{2}-\d{2}\.ts/.test(l));
if (bad.length) {
  console.error('Published role versions must not change. Add a new dated file instead:\n' + bad.join('\n'));
  process.exit(1);
}
console.log('check-role-history: ok');
