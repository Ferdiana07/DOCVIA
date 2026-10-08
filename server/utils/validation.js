const VALID_DAYS = new Set([
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
]);

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

const escapeRegExp = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const timeToMinutes = (value) => {
  const match = TIME_PATTERN.exec(String(value || ''));
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
};

const validateAvailability = (availability, { required = true } = {}) => {
  if (!Array.isArray(availability)) return 'Availability must be a list of working days.';
  if (required && availability.length === 0) return 'Select at least one available working day.';

  const seen = new Set();
  for (const slot of availability) {
    if (!slot || !VALID_DAYS.has(slot.day)) return 'Availability contains an invalid day.';
    if (seen.has(slot.day)) return `Availability contains a duplicate ${slot.day} schedule.`;
    seen.add(slot.day);

    const start = timeToMinutes(slot.startTime);
    const end = timeToMinutes(slot.endTime);
    if (start === null || end === null) return `Use a valid 24-hour time for ${slot.day}.`;
    if (start >= end) return `${slot.day} end time must be later than its start time.`;
  }

  return null;
};

module.exports = { TIME_PATTERN, escapeRegExp, timeToMinutes, validateAvailability };
