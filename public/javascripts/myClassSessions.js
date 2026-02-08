(function () {
  function initMyClassSessionCountdown() {
    const countdownElements = Array.from(document.querySelectorAll('[data-countdown-target]'));
    if (!countdownElements.length) {
      return;
    }

    function formatRemaining(ms) {
      if (ms <= 0) {
        return 'Starting soon';
      }

      const totalSeconds = Math.floor(ms / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const units = [];
      if (days > 0) {
        units.push(`${days}d`);
      }
      units.push(`${String(hours).padStart(2, '0')}h`);
      units.push(`${String(minutes).padStart(2, '0')}m`);
      units.push(`${String(seconds).padStart(2, '0')}s`);
      return units.join(' ');
    }

    function parseWeekDays(rawValue) {
      return String(rawValue || '')
        .split(',')
        .map((item) => Number(item.trim()))
        .filter((item) => Number.isInteger(item) && item >= 0 && item <= 6);
    }

    function buildDateWithTime(baseDate, timeValue) {
      const parts = String(timeValue || '').split(':');
      const hour = Number(parts[0]);
      const minute = Number(parts[1]);
      return new Date(
        baseDate.getFullYear(),
        baseDate.getMonth(),
        baseDate.getDate(),
        Number.isFinite(hour) ? hour : 0,
        Number.isFinite(minute) ? minute : 0,
        0,
        0
      );
    }

    function getNextOccurrence(element, nowDate) {
      const frequency = String(element.getAttribute('data-schedule-frequency') || 'weekly').toLowerCase();
      const startTime = element.getAttribute('data-schedule-start-time') || '18:00';
      const startDateRaw = element.getAttribute('data-schedule-start-date') || '';
      const startDate = startDateRaw ? new Date(startDateRaw) : null;
      const normalizedStartDate = startDate && !Number.isNaN(startDate.getTime())
        ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
        : new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
      const anchorDateTime = buildDateWithTime(normalizedStartDate, startTime);

      if (frequency === 'daily') {
        let candidate = buildDateWithTime(new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate()), startTime);
        if (candidate < anchorDateTime) {
          candidate = new Date(anchorDateTime.getTime());
        }
        while (candidate <= nowDate) {
          candidate = new Date(candidate.getTime() + 24 * 60 * 60 * 1000);
        }
        return candidate;
      }

      const weekDays = parseWeekDays(element.getAttribute('data-schedule-week-days'));
      const selectedWeekDays = weekDays.length ? weekDays : [normalizedStartDate.getDay()];
      for (let offset = 0; offset <= 21; offset += 1) {
        const dayCandidate = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate() + offset);
        if (!selectedWeekDays.includes(dayCandidate.getDay())) {
          continue;
        }
        const candidate = buildDateWithTime(dayCandidate, startTime);
        if (candidate < anchorDateTime) {
          continue;
        }
        if (candidate <= nowDate) {
          continue;
        }
        return candidate;
      }

      return null;
    }

    function updateAll() {
      const nowDate = new Date();
      const now = nowDate.getTime();
      countdownElements.forEach((element) => {
        const computedNext = getNextOccurrence(element, nowDate);
        const fallbackTarget = new Date(element.getAttribute('data-countdown-target') || '').getTime();
        const target = computedNext ? computedNext.getTime() : fallbackTarget;
        if (Number.isNaN(target)) {
          element.textContent = 'Invalid schedule';
          return;
        }

        const delta = target - now;
        element.textContent = formatRemaining(delta);
      });
    }

    updateAll();
    window.setInterval(updateAll, 1000);
  }

  if (document.readyState === 'complete') {
    initMyClassSessionCountdown();
  } else {
    window.addEventListener('load', initMyClassSessionCountdown, { once: true });
  }
})();
