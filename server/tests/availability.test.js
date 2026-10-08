const test = require('node:test');
const assert = require('node:assert/strict');
const { parseDateOnly, buildAvailableSlots, isSlotWithinAvailability } = require('../utils/availability');

const schedule = [{ day: 'Monday', startTime: '09:00', endTime: '11:00' }];

test('parseDateOnly rejects impossible and malformed dates', () => {
  assert.equal(parseDateOnly('2026-02-30'), null);
  assert.equal(parseDateOnly('02/10/2026'), null);
  assert.equal(parseDateOnly(''), null);
});

test('available slots follow schedule and exclude booked times', () => {
  const date = parseDateOnly('2026-10-05');
  const slots = buildAvailableSlots({
    date,
    availability: schedule,
    bookedTimes: ['09:30'],
    now: new Date(2026, 9, 4, 8, 0),
  });
  assert.deepEqual(slots, ['09:00', '10:00', '10:30']);
});

test('slot validation rejects off-grid and out-of-hours times', () => {
  const date = parseDateOnly('2026-10-05');
  assert.equal(isSlotWithinAvailability(date, '09:30', schedule), true);
  assert.equal(isSlotWithinAvailability(date, '09:15', schedule), false);
  assert.equal(isSlotWithinAvailability(date, '11:00', schedule), false);
});
