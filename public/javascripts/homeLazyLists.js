(function () {
  const lazyLists = document.querySelectorAll('.home-lazy-list');

  if (!lazyLists.length) {
    return;
  }

  const supportsIntersectionObserver = 'IntersectionObserver' in window;
  const parseBoolean = (value) => {
    if (typeof value !== 'string') {
      return Boolean(value);
    }

    const normalized = value.trim().toLowerCase();
    if (!normalized) {
      return false;
    }

    return normalized === 'true' || normalized === '1' || normalized === 'yes';
  };

  lazyLists.forEach((list) => {
    const feedType = list.dataset.feedType;
    const pageSize = parseInt(list.dataset.pageSize, 10) || 5;
    const loader = list.querySelector('.home-list-loader');
    const sentinel = list.querySelector('.home-list-sentinel');
    const emptyState = list.querySelector('.home-empty-state');

    if (!feedType || !loader || !sentinel) {
      return;
    }

    const state = {
      skip: parseInt(list.dataset.initialCount, 10) || 0,
      hasMore: parseBoolean(list.dataset.hasMore),
      isLoading: false,
    };

    if (!supportsIntersectionObserver || !state.hasMore) {
      sentinel.remove();
      return;
    }

    const renderItems = (items) => {
      const fragment = document.createDocumentFragment();

      items.forEach((item) => {
        const li = document.createElement('li');
        const link = document.createElement('a');

        link.href = item.url;
        link.textContent = item.title;
        li.appendChild(link);
        fragment.appendChild(li);
      });

      list.insertBefore(fragment, loader);

      if (emptyState) {
        emptyState.remove();
      }
    };

    let observer = null;

    const loadNextPage = async () => {
      if (state.isLoading || !state.hasMore) {
        return;
      }

      state.isLoading = true;
      loader.style.display = '';
      if (observer) {
        observer.unobserve(sentinel);
      }

      try {
        const response = await fetch(`/api/home-feed/${feedType}?skip=${state.skip}&limit=${pageSize}`);

        if (!response.ok) {
          throw new Error('Failed to fetch feed data');
        }

        const payload = await response.json();
        const items = Array.isArray(payload.items) ? payload.items : [];

        if (items.length) {
          renderItems(items);
          state.skip += items.length;
        }

        state.hasMore = Boolean(payload.hasMore);

        if (!state.hasMore) {
          if (observer) {
            observer.disconnect();
          }
          sentinel.remove();
        } else if (observer) {
          // Re-arm observer so additional batches still load when sentinel remains near viewport.
          requestAnimationFrame(() => observer.observe(sentinel));
        }
      } catch (error) {
        console.error(`[homeLazyLists] ${feedType} lazy loading failed`, error);
        if (observer) {
          requestAnimationFrame(() => observer.observe(sentinel));
        }
      } finally {
        loader.style.display = 'none';
        state.isLoading = false;
      }
    };

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadNextPage();
          }
        });
      },
      {
        root: null,
        rootMargin: '150px 0px',
        threshold: 0,
      }
    );

    observer.observe(sentinel);

    const fallbackCheck = () => {
      if (!state.hasMore || state.isLoading || !sentinel.isConnected) {
        return;
      }

      const rect = sentinel.getBoundingClientRect();
      if (rect.top <= window.innerHeight + 150) {
        loadNextPage();
      }
    };

    window.addEventListener('scroll', fallbackCheck, { passive: true });
    window.addEventListener('resize', fallbackCheck);
    fallbackCheck();
  });
})();
