const test = require('node:test');
const assert = require('node:assert/strict');
const cache = require('../utils/cache');

test('cache stores, expires, and invalidates values by prefix', async () => {
  cache.clear();
  cache.set('doctors:list:a', { count: 1 }, 20);
  cache.set('settings:public', { ok: true }, 1000);
  assert.deepEqual(cache.get('doctors:list:a'), { count: 1 });
  cache.delByPrefix('doctors:');
  assert.equal(cache.get('doctors:list:a'), undefined);
  assert.deepEqual(cache.get('settings:public'), { ok: true });
  cache.set('short', 'value', 1);
  await new Promise((resolve) => setTimeout(resolve, 5));
  assert.equal(cache.get('short'), undefined);
});
