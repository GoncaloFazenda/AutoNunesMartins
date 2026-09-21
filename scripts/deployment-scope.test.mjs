import { test } from 'node:test';
import assert from 'node:assert/strict';
import { affectsApplication } from './deployment-scope.mjs';

test('apps deploy independently', () => {
  assert.equal(affectsApplication('website', ['apps/crm/src/routes/+page.svelte']), false);
  assert.equal(affectsApplication('crm', ['apps/website/src/routes/+page.svelte']), false);
  assert.equal(affectsApplication('website', ['apps/website/static/logo.png']), true);
  assert.equal(affectsApplication('crm', ['shared/types/src/index.ts']), true);
});
test('dependency and pipeline changes redeploy; docs do not', () => {
  for (const app of ['crm', 'website']) {
    assert.equal(affectsApplication(app, ['yarn.lock']), true);
    assert.equal(affectsApplication(app, ['scripts/ignore-deployment.mjs']), true);
    assert.equal(affectsApplication(app, ['docs/notes.md']), false);
  }
  assert.equal(affectsApplication('unknown', []), true);
});
