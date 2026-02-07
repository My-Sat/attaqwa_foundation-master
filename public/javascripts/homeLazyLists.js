(function () {
  const lazyLists = document.querySelectorAll('.home-lazy-list');

  if (!lazyLists.length) {
    return;
  }

  const supportsIntersectionObserver = 'IntersectionObserver' in window;

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
      hasMore: list.dataset.hasMore === 'true',
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

    const loadNextPage = async () => {
      if (state.isLoading || !state.hasMore) {
        return;
      }

      state.isLoading = true;
      loader.style.display = '';

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
          observer.disconnect();
          sentinel.remove();
        }
      } catch (error) {
        console.error(`[homeLazyLists] ${feedType} lazy loading failed`, error);
      } finally {
        loader.style.display = 'none';
        state.isLoading = false;
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadNextPage();
          }
        });
      },
      {
        root: list,
        rootMargin: '150px 0px',
        threshold: 0,
      }
    );

    observer.observe(sentinel);
  });
})();
