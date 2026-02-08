function normalizeWeekDays(input) {
  const source = Array.isArray(input) ? input : [input];
  const values = source
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item >= 0 && item <= 6);
  return Array.from(new Set(values)).sort((a, b) => a - b);
}

function normalizeStartTime(value) {
  const raw = String(value || '').trim();
  if (!/^\d{2}:\d{2}$/.test(raw)) {
    return '18:00';
  }
  return raw;
}

function normalizeDurationMinutes(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 60;
  }
  const rounded = Math.round(parsed);
  if (rounded < 15) {
    return 15;
  }
  if (rounded > 720) {
    return 720;
  }
  return rounded;
}

function normalizeFrequency(value) {
  return String(value || '').trim().toLowerCase() === 'daily' ? 'daily' : 'weekly';
}

function normalizeStartDate(value) {
  if (!value) {
    return null;
  }

  const candidate = value instanceof Date ? new Date(value.getTime()) : new Date(String(value));
  if (Number.isNaN(candidate.getTime())) {
    return null;
  }

  return new Date(candidate.getFullYear(), candidate.getMonth(), candidate.getDate());
}

function getNormalizedSchedule(session) {
  const rawSchedule = session && session.schedule ? session.schedule : {};
  const frequency = normalizeFrequency(rawSchedule.frequency);
  const normalizedWeekDays = normalizeWeekDays(rawSchedule.weekDays);

  return {
    startDate: normalizeStartDate(rawSchedule.startDate),
    startTime: normalizeStartTime(rawSchedule.startTime),
    durationMinutes: normalizeDurationMinutes(rawSchedule.durationMinutes),
    frequency,
    weekDays: frequency === 'daily'
      ? []
      : (normalizedWeekDays.length ? normalizedWeekDays : [1]),
  };
}

function buildDateWithTime(baseDate, timeValue) {
  const [hoursRaw, minutesRaw] = normalizeStartTime(timeValue).split(':');
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);
  return new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
    Number.isFinite(hours) ? hours : 0,
    Number.isFinite(minutes) ? minutes : 0,
    0,
    0
  );
}

function getNextSessionStart(session, fromDateInput) {
  const fromDate = fromDateInput ? new Date(fromDateInput) : new Date();
  if (Number.isNaN(fromDate.getTime())) {
    return null;
  }

  const schedule = getNormalizedSchedule(session);
  const anchorDate = schedule.startDate || new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  const anchorDateTime = buildDateWithTime(anchorDate, schedule.startTime);
  const frequency = schedule.frequency;

  if (frequency === 'daily') {
    let candidate = buildDateWithTime(new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate()), schedule.startTime);
    if (candidate < anchorDateTime) {
      candidate = new Date(anchorDateTime.getTime());
    }
    while (candidate <= fromDate) {
      candidate = new Date(candidate.getTime() + 24 * 60 * 60 * 1000);
    }
    return candidate;
  }

  const selectedWeekDays = schedule.weekDays.length ? schedule.weekDays : [anchorDate.getDay()];
  for (let dayOffset = 0; dayOffset <= 21; dayOffset += 1) {
    const dayCandidate = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate() + dayOffset);
    const dayOfWeek = dayCandidate.getDay();
    if (!selectedWeekDays.includes(dayOfWeek)) {
      continue;
    }

    const candidate = buildDateWithTime(dayCandidate, schedule.startTime);
    if (candidate < anchorDateTime) {
      continue;
    }
    if (candidate <= fromDate) {
      continue;
    }
    return candidate;
  }

  return null;
}

function getWeekDayLabel(day) {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day] || 'N/A';
}

function getScheduleSummary(session) {
  const schedule = getNormalizedSchedule(session);
  const dailyOrWeekly = schedule.frequency === 'daily'
    ? 'Every day'
    : `Weekly: ${schedule.weekDays.map((day) => getWeekDayLabel(day)).join(', ')}`;
  const startDateText = schedule.startDate ? ` from ${schedule.startDate.toLocaleDateString()}` : '';
  return `${dailyOrWeekly} at ${schedule.startTime}${startDateText}`;
}

module.exports = {
  normalizeWeekDays,
  normalizeStartDate,
  normalizeStartTime,
  normalizeDurationMinutes,
  normalizeFrequency,
  getNormalizedSchedule,
  getNextSessionStart,
  getScheduleSummary,
};
