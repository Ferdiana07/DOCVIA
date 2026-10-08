const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const parseDateOnly = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

const dateTimeFor = (date, time) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime()) || !/^\d{2}:\d{2}$/.test(time || '')) return null;
  const [hours, minutes] = time.split(':').map(Number);
  if (hours > 23 || minutes > 59) return null;
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
};

const toMinutes = (time) => {
  const match = /^(\d{2}):(\d{2})$/.exec(time || '');
  if (!match) return null;
  const value = Number(match[1]) * 60 + Number(match[2]);
  return Number(match[1]) < 24 && Number(match[2]) < 60 ? value : null;
};

const formatMinutes = (minutes) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

const buildAvailableSlots = ({ date, availability = [], bookedTimes = [], now = new Date(), slotMinutes = 30, leadTimeHours = 0 }) => {
  const dayName = DAYS[date.getDay()];
  const blocked = new Set(bookedTimes);
  const earliest = new Date(now.getTime() + leadTimeHours * 60 * 60 * 1000);
  const slots = [];

  availability.filter((entry) => entry.day === dayName).forEach((entry) => {
    const start = toMinutes(entry.startTime);
    const end = toMinutes(entry.endTime);
    if (start === null || end === null || start >= end) return;
    for (let minute = start; minute + slotMinutes <= end; minute += slotMinutes) {
      const time = formatMinutes(minute);
      const dateTime = dateTimeFor(date, time);
      if (!blocked.has(time) && dateTime >= earliest) slots.push(time);
    }
  });
  return [...new Set(slots)].sort();
};

const isSlotWithinAvailability = (date, time, availability = [], slotMinutes = 30) => {
  const minute = toMinutes(time);
  if (minute === null) return false;
  return availability.some((entry) => {
    if (entry.day !== DAYS[date.getDay()]) return false;
    const start = toMinutes(entry.startTime);
    const end = toMinutes(entry.endTime);
    return start !== null && end !== null && minute >= start && minute + slotMinutes <= end && (minute - start) % slotMinutes === 0;
  });
};

module.exports = { DAYS, parseDateOnly, dateTimeFor, buildAvailableSlots, isSlotWithinAvailability };
