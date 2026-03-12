import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCategoryMenuActivities,
  buildNaturalLanguageMatchActivities,
  buildPlaybookFlowActivities,
  resolveNaturalLanguagePlaybook
} from './playbook-engine.mjs';

test('resolveNaturalLanguagePlaybook maps common queries to the closest playbook', () => {
  assert.equal(
    resolveNaturalLanguagePlaybook('show bgp session health for this prefix')?.id,
    'bgp-advertisers-session-health'
  );
  assert.equal(
    resolveNaturalLanguagePlaybook('which vm has noisy neighbour contention')?.id,
    'noisy-neighbour-investigation'
  );
  assert.equal(resolveNaturalLanguagePlaybook('hello there'), undefined);
});

test('buildCategoryMenuActivities emits a standard Adaptive Card menu', () => {
  const [activity] = buildCategoryMenuActivities({});
  assert.equal(activity.type, 'message');
  assert.equal(activity.attachments[0].contentType, 'application/vnd.microsoft.card.adaptive');
  assert.equal(activity.attachments[0].content.type, 'AdaptiveCard');
  assert.equal(activity.attachments[0].content.actions.length, 4);
});

test('buildPlaybookFlowActivities emits a standard seven-card guided flow', () => {
  const activities = buildPlaybookFlowActivities('service-slo-sla-status', {});
  assert.equal(activities.length, 7);
  assert.equal(activities[0].attachments[0].content.type, 'AdaptiveCard');
  assert.equal(activities[6].attachments[0].content.actions.length, 3);
});

test('buildNaturalLanguageMatchActivities includes an intro plus the playbook flow', () => {
  const activities = buildNaturalLanguageMatchActivities('show top source asns for last day', {});
  assert.equal(activities.length, 8);
  assert.match(activities[0].text, /Matched your request/);
});
