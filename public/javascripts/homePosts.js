(function () {
  function initHomePosts() {
    const postsContainer = document.getElementById('communityPosts');
    if (!postsContainer) {
      return;
    }

    const loadMoreButton = document.getElementById('loadMorePostsBtn');
    const composerForm = document.getElementById('postComposer');
    const composerBody = document.getElementById('postBody');
    const feedback = document.getElementById('communityFeedback');
    const emptyState = document.getElementById('communityEmptyState');
    const isLoggedIn = String(postsContainer.dataset.isLoggedIn || '').toLowerCase() === 'true';

    const state = {
      skip: parseInt(postsContainer.dataset.initialCount, 10) || 0,
      pageSize: parseInt(postsContainer.dataset.pageSize, 10) || 5,
      hasMore: String(postsContainer.dataset.hasMore || '').toLowerCase() === 'true',
      isLoading: false,
    };

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function formatDateTime(value) {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return 'N/A';
      }
      return date.toLocaleString();
    }

    function showFeedback(message, type) {
      if (!feedback) {
        return;
      }

      feedback.classList.remove('d-none', 'text-danger', 'text-success');
      feedback.classList.add(type === 'error' ? 'text-danger' : 'text-success');
      feedback.textContent = message;
    }

    function clearFeedback() {
      if (!feedback) {
        return;
      }
      feedback.classList.add('d-none');
      feedback.textContent = '';
    }

    function updateLoadMoreVisibility() {
      if (!loadMoreButton) {
        return;
      }
      if (state.hasMore) {
        loadMoreButton.classList.remove('d-none');
      } else {
        loadMoreButton.classList.add('d-none');
      }
    }

    function buildCommentMarkup(comment) {
      return `
        <li class="community-comment-item mb-2">
          <div>
            <strong>${escapeHtml(comment.authorName || 'User')}</strong>
            <span class="text-muted small ms-2">${comment.authorType === 'admin' ? 'Admin' : 'User'}</span>
          </div>
          <p class="mb-1">${escapeHtml(comment.body || '')}</p>
          <small class="text-muted">${escapeHtml(formatDateTime(comment.createdAt))}</small>
        </li>
      `;
    }

    function buildPostMarkup(post) {
      const comments = Array.isArray(post.comments) ? post.comments : [];
      const commentsMarkup = comments.length
        ? comments.map(buildCommentMarkup).join('')
        : '<li class="text-muted small community-no-comments">No comments yet.</li>';
      const commentFormMarkup = isLoggedIn
        ? `
          <form class="community-comment-form" data-post-id="${post.id}">
            <div class="input-group">
              <input class="form-control auth-input" type="text" name="body" maxlength="700" placeholder="Write a comment..." required>
              <button class="btn btn-outline-primary" type="submit">Comment</button>
            </div>
          </form>
        `
        : '';

      return `
        <article class="community-post card mb-3" data-post-id="${post.id}">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
              <div>
                <strong class="community-author">${escapeHtml(post.authorName || 'User')}</strong>
                <span class="text-muted small ms-2">${post.authorType === 'admin' ? 'Admin' : 'User'}</span>
              </div>
              <small class="text-muted">${escapeHtml(formatDateTime(post.createdAt))}</small>
            </div>
            <p class="community-body mb-3">${escapeHtml(post.body || '')}</p>
            <div class="community-comments-wrap">
              <h6 class="community-comment-title mb-2">Comments (<span class="community-comment-count">${Number(post.commentsCount || comments.length || 0)}</span>)</h6>
              <ul class="community-comments list-unstyled mb-2">${commentsMarkup}</ul>
              ${commentFormMarkup}
            </div>
          </div>
        </article>
      `;
    }

    function prependPost(post) {
      if (emptyState) {
        emptyState.remove();
      }
      postsContainer.insertAdjacentHTML('afterbegin', buildPostMarkup(post));
      state.skip += 1;
    }

    function appendPosts(posts) {
      if (!Array.isArray(posts) || !posts.length) {
        return;
      }

      if (emptyState) {
        emptyState.remove();
      }

      const html = posts.map(buildPostMarkup).join('');
      postsContainer.insertAdjacentHTML('beforeend', html);
      state.skip += posts.length;
    }

    async function request(url, options) {
      const response = await fetch(url, options);
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || 'Request failed.');
      }
      return payload;
    }

    async function loadMorePosts() {
      if (state.isLoading || !state.hasMore) {
        return;
      }

      state.isLoading = true;
      if (loadMoreButton) {
        loadMoreButton.disabled = true;
        loadMoreButton.textContent = 'Loading...';
      }

      try {
        const payload = await request(`/api/posts?skip=${state.skip}&limit=${state.pageSize}`);
        appendPosts(payload.posts || []);
        state.hasMore = Boolean(payload.hasMore);
        updateLoadMoreVisibility();
      } catch (error) {
        showFeedback(error.message, 'error');
      } finally {
        state.isLoading = false;
        if (loadMoreButton) {
          loadMoreButton.disabled = false;
          loadMoreButton.textContent = 'View more posts';
        }
      }
    }

    async function submitPost(event) {
      event.preventDefault();
      clearFeedback();

      if (!composerBody) {
        return;
      }

      const body = (composerBody.value || '').trim();
      if (!body) {
        showFeedback('Post text is required.', 'error');
        return;
      }

      try {
        const payload = await request('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body }),
        });

        composerBody.value = '';
        prependPost(payload.post);
        showFeedback('Post published.', 'success');
      } catch (error) {
        showFeedback(error.message, 'error');
      }
    }

    async function submitComment(form) {
      clearFeedback();
      const postId = form.getAttribute('data-post-id') || '';
      const input = form.querySelector('input[name="body"]');
      if (!postId || !input) {
        return;
      }

      const body = (input.value || '').trim();
      if (!body) {
        showFeedback('Comment text is required.', 'error');
        return;
      }

      const button = form.querySelector('button[type="submit"]');
      if (button) {
        button.disabled = true;
      }

      try {
        const payload = await request(`/api/posts/${postId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body }),
        });

        const article = form.closest('.community-post');
        const commentsList = article ? article.querySelector('.community-comments') : null;
        const noComments = commentsList ? commentsList.querySelector('.community-no-comments') : null;
        if (noComments) {
          noComments.remove();
        }
        if (commentsList && payload.comment) {
          commentsList.insertAdjacentHTML('beforeend', buildCommentMarkup(payload.comment));
        }
        const countElement = article ? article.querySelector('.community-comment-count') : null;
        if (countElement && Number.isFinite(Number(payload.commentsCount))) {
          countElement.textContent = String(payload.commentsCount);
        }
        input.value = '';
      } catch (error) {
        showFeedback(error.message, 'error');
      } finally {
        if (button) {
          button.disabled = false;
        }
      }
    }

    if (composerForm) {
      composerForm.addEventListener('submit', submitPost);
    }

    if (loadMoreButton) {
      loadMoreButton.addEventListener('click', loadMorePosts);
      updateLoadMoreVisibility();
    }

    postsContainer.addEventListener('submit', (event) => {
      const form = event.target.closest('.community-comment-form');
      if (!form) {
        return;
      }
      event.preventDefault();
      submitComment(form);
    });
  }

  if (document.readyState === 'complete') {
    initHomePosts();
  } else {
    window.addEventListener('load', initHomePosts, { once: true });
  }
})();
