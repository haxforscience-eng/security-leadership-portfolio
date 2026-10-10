import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
let checked = 0;
for (const name of ['index.html', 'workbench.html']) {
  const html = fs.readFileSync(path.join(root, name), 'utf8');
  assert.match(html, /<html lang="en">/);
  assert.match(html, /Content-Security-Policy/);
  assert.match(html, /Skip to content/);
  assert.match(html, /synthetic/i);
  assert.doesNotMatch(html, /<script\b[^>]*>[^<\s][\s\S]*?<\/script>/i);
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(x => x[1]));
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const target = match[1];
    if (/^(?:https?:|data:)/.test(target)) continue;
    const [file, fragment] = target.split('#');
    const filename = file || name;
    const absolute = path.resolve(root, filename);
    assert.ok(absolute.startsWith(root + path.sep), `Path escape: ${target}`);
    assert.ok(fs.existsSync(absolute), `Missing ${target} from ${name}`);
    if (fragment && filename.endsWith('.html')) {
      const targetIds = filename === name ? ids : new Set([...fs.readFileSync(absolute, 'utf8').matchAll(/\bid="([^"]+)"/g)].map(x => x[1]));
      assert.ok(targetIds.has(fragment), `Missing fragment ${target}`);
    }
    checked++;
  }
}
const evidence = JSON.parse(fs.readFileSync(path.join(root, 'data/evidence.json'), 'utf8'));
assert.equal(evidence.synthetic, true);
assert.equal(evidence.scenarios.length, 9);
assert.deepEqual(evidence.summary, { scenarios: 9, completed: 3, blocked: 6 });
assert.equal(evidence.verification.valid, true);
assert.ok(fs.statSync(path.join(root, 'downloads/agent-governance-kit.zip')).size > 1000);
console.log(`PASS: ${checked} internal references, synthetic evidence and project download verified.`);
