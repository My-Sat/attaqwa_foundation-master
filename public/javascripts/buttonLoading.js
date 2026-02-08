(function () {
  function isHTMLElement(node) {
    return node && node.nodeType === 1;
  }

  function isButtonLike(element) {
    return isHTMLElement(element) && (
      element.matches('button') ||
      element.matches('input[type="submit"]') ||
      element.matches('a.btn')
    );
  }

  function hasOptOut(element) {
    return element.hasAttribute('data-no-loading');
  }

  function shouldSkipAnchor(anchor, event) {
    const href = (anchor.getAttribute('href') || '').trim();

    if (!href || href.startsWith('#') || href.startsWith('javascript:')) {
      return true;
    }

    if (anchor.hasAttribute('download')) {
      return true;
    }

    if (anchor.target && anchor.target.toLowerCase() === '_blank') {
      return true;
    }

    if (event && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)) {
      return true;
    }

    return false;
  }

  function setLoadingState(element) {
    if (!isButtonLike(element) || hasOptOut(element) || element.classList.contains('is-loading')) {
      return;
    }

    const loadingText = element.getAttribute('data-loading-text') || 'Loading...';

    if (!element.dataset.loadingOriginalHtml) {
      element.dataset.loadingOriginalHtml = element.innerHTML;
    }

    if (!element.dataset.loadingOriginalAriaBusy) {
      element.dataset.loadingOriginalAriaBusy = element.getAttribute('aria-busy') || '';
    }

    element.classList.add('is-loading');
    element.setAttribute('aria-busy', 'true');

    if (element.matches('a.btn')) {
      element.style.pointerEvents = 'none';
    } else {
      element.disabled = true;
    }

    element.innerHTML = `<span class="btn-loading-content"><span class="btn-loading-spinner" aria-hidden="true"></span><span>${loadingText}</span></span>`;
  }

  document.addEventListener('submit', (event) => {
    const form = event.target;
    if (!isHTMLElement(form) || !form.matches('form')) {
      return;
    }

    const submitter = event.submitter;

    if (isButtonLike(submitter) && !hasOptOut(submitter)) {
      setLoadingState(submitter);
      return;
    }

    const fallbackButton = form.querySelector('button[type="submit"], input[type="submit"]');
    if (fallbackButton) {
      setLoadingState(fallbackButton);
    }
  }, true);

  document.addEventListener('click', (event) => {
    const anchor = event.target.closest('a.btn');
    if (!anchor || hasOptOut(anchor) || shouldSkipAnchor(anchor, event)) {
      return;
    }

    setLoadingState(anchor);
  }, true);
})();
