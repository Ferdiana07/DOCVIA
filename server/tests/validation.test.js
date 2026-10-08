const test = require('node:test');
const assert = require('node:assert/strict');
const { escapeRegExp, validateAvailability } = require('../utils/validation');

test('escapeRegExp treats user search input as literal text', () => {
  const escaped = escapeRegExp('cardio.*(test)');
  const regex = new RegExp(escaped, 'i');
  assert.equal(regex.test('cardio.*(test)'), true);
  assert.equal(regex.test('cardio-anything-test'), false);
});

test('availability validation accepts a useful schedule', () => {
  assert.equal(validateAvailability([
    { day: 'Monday', startTime: '09:00', endTime: '17:00' },
    { day: 'Friday', startTime: '08:30', endTime: '12:00' },
  ]), null);
});

test('availability validation rejects empty, duplicate, and reversed schedules', () => {
  assert.match(validateAvailability([]), /at least one/i);
  assert.match(validateAvailability([
    { day: 'Monday', startTime: '09:00', endTime: '17:00' },
    { day: 'Monday', startTime: '10:00', endTime: '12:00' },
  ]), /duplicate/i);
  assert.match(validateAvailability([
    { day: 'Tuesday', startTime: '17:00', endTime: '09:00' },
  ]), /later/i);
});
