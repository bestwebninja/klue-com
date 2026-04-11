import test from 'node:test';
import assert from 'node:assert/strict';
import { canTransitionLifecycle, requiresAdmin } from './partner-admin.js';

test('allows submitted -> approved/rejected/needs_info', () => {
  assert.equal(canTransitionLifecycle('submitted', 'approved'), true);
  assert.equal(canTransitionLifecycle('submitted', 'rejected'), true);
  assert.equal(canTransitionLifecycle('submitted', 'needs_info'), true);
});

test('prevents terminal status rewrites', () => {
  assert.equal(canTransitionLifecycle('approved', 'rejected'), false);
  assert.equal(canTransitionLifecycle('rejected', 'approved'), false);
});

test('requires admin role for privileged action', () => {
  assert.equal(requiresAdmin('admin'), true);
  assert.equal(requiresAdmin('provider'), false);
  assert.equal(requiresAdmin(undefined), false);
});
