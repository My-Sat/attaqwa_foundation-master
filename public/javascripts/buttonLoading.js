(function () {
  const LOADING_SELECTOR = '.is-loading[data-loading-original-content]';

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

    const isInputSubmit = element.matches('input[type="submit"]');
    const originalContent = isInputSubmit ? element.value : element.innerHTML;

    if (!element.dataset.loadingOriginalContent) {
      element.dataset.loadingOriginalContent = originalContent || '';
    }

    element.classList.add('is-loading');
    element.setAttribute('aria-busy', 'true');

    if (element.matches('a.btn')) {
      element.style.pointerEvents = 'none';
    } else {
      element.disabled = true;
    }

    if (isInputSubmit) {
      element.value = loadingText;
    } else {
      element.innerHTML = `<span class="btn-loading-content"><span class="btn-loading-spinner" aria-hidden="true"></span><span>${loadingText}</span></span>`;
    }
  }

  function resetLoadingState(element) {
    if (!isButtonLike(element) || !element.classList.contains('is-loading')) {
      return;
    }

    const isInputSubmit = element.matches('input[type="submit"]');
    const originalContent = element.dataset.loadingOriginalContent || '';

    element.classList.remove('is-loading');
    element.removeAttribute('aria-busy');

    if (element.matches('a.btn')) {
      element.style.pointerEvents = '';
    } else {
      element.disabled = false;
    }

    if (isInputSubmit) {
      element.value = originalContent;
    } else {
      element.innerHTML = originalContent;
    }

    delete element.dataset.loadingOriginalContent;
  }

  function resetAllLoadingStates() {
    document.querySelectorAll(LOADING_SELECTOR).forEach((node) => {
      resetLoadingState(node);
    });
  }

  document.addEventListener('submit', (event) => {
    const form = event.target;
    if (!isHTMLElement(form) || !form.matches('form')) {
      return;
    }

    const submitter = event.submitter;

    // Delay until other handlers run so AJAX forms with preventDefault don't get stuck in loading state.
    setTimeout(() => {
      if (event.defaultPrevented) {
        return;
      }

      if (isButtonLike(submitter) && !hasOptOut(submitter)) {
        setLoadingState(submitter);
        return;
      }

      const fallbackButton = form.querySelector('button[type="submit"], input[type="submit"]');
      if (fallbackButton) {
        setLoadingState(fallbackButton);
      }
    }, 0);
  }, true);

  document.addEventListener('click', (event) => {
    const anchor = event.target.closest('a.btn');
    if (!anchor || hasOptOut(anchor) || shouldSkipAnchor(anchor, event)) {
      return;
    }

    setLoadingState(anchor);
  }, true);

  // Restore stale loading UI when browser restores page from bfcache or history state.
  window.addEventListener('pageshow', () => {
    resetAllLoadingStates();
  });
})();
