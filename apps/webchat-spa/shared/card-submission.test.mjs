import test from 'node:test';
import assert from 'node:assert/strict';
import { ADAPTIVE_CARD_CONTENT_TYPE, isCardSubmitted } from './card-submission.mjs';

const card = (key, { byId = false } = {}) => ({
  ...(byId ? { id: key } : { channelData: { 'webchat:key': key } }),
  from: { role: 'bot' },
  attachments: [{ contentType: ADAPTIVE_CARD_CONTENT_TYPE }]
});
const postBack = (key) => ({
  channelData: { 'webchat:key': key, postBack: true },
  from: { role: 'user' }
});
const typed = (key) => ({ channelData: { 'webchat:key': key }, from: { role: 'user' }, text: 'hi' });

test('a card with no later postback is not submitted', () => {
  const c = card('c1');
  assert.equal(isCardSubmitted([c], c), false);
});

test('a later user postback marks the card submitted', () => {
  const c = card('c1');
  assert.equal(isCardSubmitted([c, postBack('p1')], c), true);
});

test('a newer bot card in between owns the postback', () => {
  const older = card('c1');
  const newer = card('c2');
  const acts = [older, newer, postBack('p1')];
  assert.equal(isCardSubmitted(acts, older), false);
  assert.equal(isCardSubmitted(acts, newer), true);
});

test('a plain typed user message does not submit the card', () => {
  const c = card('c1');
  assert.equal(isCardSubmitted([c, typed('t1')], c), false);
});

test('a card absent from the transcript is not submitted', () => {
  assert.equal(isCardSubmitted([card('c1'), postBack('p1')], card('other')), false);
});

test('activities keyed by id work like those keyed by webchat:key', () => {
  const c = card('server-id-1', { byId: true });
  assert.equal(isCardSubmitted([c, postBack('p1')], c), true);
  assert.equal(isCardSubmitted([c], c), false);
});

test('webchat:key wins over id when both are present', () => {
  const c = { ...card('k1'), id: 'server-id' };
  const echoed = { ...card('k1'), id: 'different-id' };
  assert.equal(isCardSubmitted([echoed, postBack('p1')], c), true);
});

test('a card with neither key nor id is never submitted', () => {
  const c = { from: { role: 'bot' }, attachments: [{ contentType: ADAPTIVE_CARD_CONTENT_TYPE }] };
  assert.equal(isCardSubmitted([c, postBack('p1')], c), false);
});
