'use strict';
const byId = (id) => document.getElementById(id);
const friendly = {
  WITHIN_MANDATE: 'The declared action stays within the registered agent mandate.',
  HUMAN_REVIEW_REQUIRED: 'Material impact requires an independent approval before execution.',
  EGRESS_NOT_ALLOWED: 'The destination host is outside the agent’s exact egress allowlist.',
  TOOL_NOT_REGISTERED: 'The tool is not registered. An agent cannot create its own authority.',
  CLASSIFICATION_EXCEEDS_GRANT: 'The declared data classification exceeds this agent’s ceiling.',
  BUDGET_EXCEEDED: 'The declared reservation would exceed the database-lifetime cost cap.',
  EMERGENCY_STOP: 'An operator has stopped new execution reservations.'
};
function addField(list, title, value) {
  const group = document.createElement('div');
  const dt = document.createElement('dt'); dt.textContent = title;
  const dd = document.createElement('dd'); dd.textContent = String(value);
  group.append(dt, dd); list.append(group);
}
function renderScenario(scenario, index, buttons) {
  buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  byId('scenario-id').textContent = `SCENARIO ${String(index + 1).padStart(2, '0')} / SYNTHETIC`;
  byId('scenario-title').textContent = scenario.title;
  byId('scenario-description').textContent = scenario.description;
  const outcome = scenario.decision.outcome;
  byId('outcome').textContent = { allow: 'ALLOW', review: 'REVIEW REQUIRED', deny: 'DENY' }[outcome];
  byId('outcome').className = `badge ${outcome}`;
  byId('reason').textContent = scenario.decision.reasons.map((reason) => friendly[reason] || reason).join(' ');
  const list = byId('intent-fields'); list.replaceChildren();
  const intent = scenario.intent;
  [['Agent', intent.agent_id], ['Tool', intent.tool], ['Resource', intent.resource], ['Environment', intent.environment], ['Classification', intent.classification], ['Reserved cost request', `$${(intent.estimated_cost_cents / 100).toFixed(2)} synthetic`], ['Destination', intent.destination || 'No external destination'], ['Policy fingerprint', scenario.decision.policy_digest.slice(0, 16) + '…']].forEach(([title, value]) => addField(list, title, value));
  const roles = scenario.decision.required_roles;
  byId('approval-status').textContent = roles.length ? `Required: ${roles.join(' + ')}. Recorded: ${scenario.approvals.length ? scenario.approvals.join(', ') : 'none'}.` : outcome === 'deny' ? 'This intent is denied. An approval cannot override the policy refusal.' : 'This bounded intent does not require human approval under the synthetic policy.';
  byId('execution-status').textContent = scenario.execution.status === 'completed' ? `${scenario.adapter_calls} fixture adapter call. No external side effects.` : `Blocked. ${scenario.adapter_calls} adapter calls. ${scenario.execution.reason}`;
  byId('replay-status').textContent = scenario.replay_blocked ? 'A second execution of this request was refused by the Python gate.' : 'No successful execution to replay.';
  byId('raw-receipt').textContent = JSON.stringify(scenario, null, 2);
}
async function start() {
  try {
    const response = await fetch('data/evidence.json', { credentials: 'omit' });
    if (!response.ok) throw new Error('Evidence request failed');
    const data = await response.json();
    if (data.schema_version !== 1 || data.synthetic !== true || !Array.isArray(data.scenarios) || data.scenarios.length !== 9) throw new Error('Unsupported evidence package');
    byId('scenario-count').textContent = data.summary.scenarios;
    byId('completed-count').textContent = data.summary.completed;
    byId('blocked-count').textContent = data.summary.blocked;
    byId('audit-status').textContent = data.verification.valid ? 'Verified*' : 'Failed';
    byId('audit-status').title = 'Verification was performed by Python at export, not cryptographically repeated in your browser.';
    const buttons = data.scenarios.map((scenario, index) => {
      const button = document.createElement('button'); button.type = 'button'; button.setAttribute('aria-pressed', 'false');
      const title = document.createElement('span'); title.textContent = scenario.title;
      const dot = document.createElement('span'); dot.className = 'status-dot'; dot.setAttribute('aria-hidden', 'true');
      button.append(title, dot);
      button.addEventListener('click', () => { renderScenario(scenario, index, buttons); history.replaceState(null, '', `#${scenario.id}`); });
      byId('scenario-list').append(button); return button;
    });
    const requested = data.scenarios.findIndex((scenario) => `#${scenario.id}` === location.hash);
    renderScenario(data.scenarios[Math.max(0, requested)], Math.max(0, requested), buttons);
    data.evidence.entries.forEach((entry) => {
      const row = document.createElement('tr');
      [entry.body.sequence, entry.body.event.replaceAll('_', ' '), entry.body.details.request_id || entry.body.details.operator || '—'].forEach((value) => { const cell = document.createElement('td'); cell.textContent = String(value); row.append(cell); });
      byId('audit-rows').append(row);
    });
    byId('audit-head').textContent = data.evidence.audit_head;
  } catch (error) {
    byId('load-error').hidden = false;
    byId('load-error').textContent = 'The evidence package could not be loaded. Serve this site over HTTP or download the JSON evidence and executive brief below.';
    byId('scenario-title').textContent = 'Evidence unavailable';
    byId('outcome').textContent = 'UNAVAILABLE';
  }
}
start();
