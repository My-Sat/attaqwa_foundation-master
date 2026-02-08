(function () {
  function initHomeCountdown() {
    const countdownElement = document.getElementById('liveStreamCountdown');
    const noteElement = document.getElementById('liveStreamNote');

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

    function renderCountdown() {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        countdownElement.textContent = 'Incoming live video should be live now.';
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
