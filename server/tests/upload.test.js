const test = require('node:test');
const assert = require('node:assert/strict');
const { matchesFileSignature } = require('../middleware/upload');

test('upload signature validation accepts PDF, PNG, and JPEG headers', () => {
  assert.equal(matchesFileSignature(Buffer.from('%PDF-1.7')), true);
  assert.equal(matchesFileSignature(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), true);
  assert.equal(matchesFileSignature(Buffer.from([0xff, 0xd8, 0xff, 0xe0])), true);
});

test('upload signature validation rejects disguised text content', () => {
  assert.equal(matchesFileSignature(Buffer.from('not a real file')), false);
});
