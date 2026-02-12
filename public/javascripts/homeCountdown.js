(function () {
  function initHomeCountdown() {
    const countdownElement = document.getElementById('liveStreamCountdown');
    const noteElement = document.getElementById('liveStreamNote');
    const liveStreamFrame = document.getElementById('liveStreamFrame');

    if (!countdownElement) {
      return;
    }

    const startAtRaw = (countdownElement.dataset.startAt || '').trim();
    const note = noteElement ? (noteElement.dataset.note || '').trim() : '';

    if (!startAtRaw) {
      countdownElement.textContent = 'No incoming live video for the moment';
      if (noteElement) {
        noteElement.textContent = '';
      }
      return;
    }

    const targetDate = new Date(startAtRaw);
    if (Number.isNaN(targetDate.getTime())) {
      countdownElement.textContent = 'No incoming live video for the moment';
      if (noteElement) {
        noteElement.textContent = '';
      }
      return;
    }

    if (noteElement) {
      noteElement.textContent = note ? `Incoming live video: ${note}` : '';
    }

    let livePollingTimer = null;
    let isRefreshingLiveStream = false;
    let hasTriggeredAutoplay = false;

    function buildAutoplayUrl(rawUrl) {
      const value = String(rawUrl || '').trim();
      if (!value) {
        return '';
      }

      try {
        const url = new URL(value, window.location.origin);
        url.searchParams.set('autoplay', '1');
        url.searchParams.set('mute', '1');
        url.searchParams.set('playsinline', '1');
        return url.toString();
      } catch (error) {
        const hasQuery = value.includes('?');
        const separator = hasQuery ? '&' : '?';
        return `${value}${separator}autoplay=1&mute=1&playsinline=1`;
      }
    }

    async function refreshLiveStreamSource() {
      if (isRefreshingLiveStream) {
        return;
      }

      isRefreshingLiveStream = true;
      try {
        const response = await fetch('/api/live-stream/current', {
          headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
          return;
        }

        const payload = await response.json().catch(() => ({}));
        const nextSrc = payload && payload.liveVideoUrl ? String(payload.liveVideoUrl) : '';
        if (liveStreamFrame && nextSrc) {
          const shouldAutoplay = Boolean(payload && payload.isLive);
          const targetSrc = shouldAutoplay ? buildAutoplayUrl(nextSrc) : nextSrc;
          const mustReloadForAutoplay = shouldAutoplay && !hasTriggeredAutoplay;

          if (liveStreamFrame.src !== targetSrc || mustReloadForAutoplay) {
            liveStreamFrame.src = targetSrc;
          }

          if (shouldAutoplay) {
            hasTriggeredAutoplay = true;
          }
        }

        if (payload && payload.isLive) {
          countdownElement.textContent = 'Live video is now streaming.';
        } else if (!payload || !payload.isLive) {
          countdownElement.textContent = 'Incoming live video should be live now.';
        }
      } catch (error) {
        // no-op
      } finally {
        isRefreshingLiveStream = false;
      }
    }

    function startLiveRefreshPolling() {
      if (livePollingTimer) {
        return;
      }

      refreshLiveStreamSource();
      livePollingTimer = window.setInterval(refreshLiveStreamSource, 30000);
    }

    function renderCountdown() {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        countdownElement.textContent = 'Incoming live video should be live now.';
        startLiveRefreshPolling();
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      if (days > 0) {
        countdownElement.textContent = `Starts in ${days}d ${hours}h ${minutes}m ${seconds}s`;
        return;
      }

      countdownElement.textContent = `Starts in ${hours}h ${minutes}m ${seconds}s`;
    }

    renderCountdown();
    window.setInterval(renderCountdown, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHomeCountdown);
  } else {
    initHomeCountdown();
  }
})();
