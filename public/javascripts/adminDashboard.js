(function () {
  function initAdminDashboard() {
    const categoryList = document.getElementById('categoryList');
    const videoList = document.getElementById('videoList');
    const adminList = document.getElementById('adminList');
    const questionList = document.getElementById('questionList');
    const articleList = document.getElementById('articleList');
    const classList = document.getElementById('classList');

    if (!categoryList || !videoList || !adminList || !questionList || !articleList || !classList) {
      return;
    }

    const categoryFilter = document.getElementById('videoCategoryFilter');
    const categorySelect = document.getElementById('videoCategory');
    const categoryForm = document.getElementById('categoryForm');
    const videoForm = document.getElementById('videoForm');
    const classSessionForm = document.getElementById('classSessionForm');
    const classSessionTitle = document.getElementById('classSessionTitle');
    const classSessionEditForm = document.getElementById('classSessionEditForm');
    const classSessionEditId = document.getElementById('classSessionEditId');
    const classSessionEditTitle = document.getElementById('classSessionEditTitle');
    const classSessionUsersTitle = document.getElementById('classSessionUsersTitle');
    const classSessionUsersList = document.getElementById('classSessionUsersList');
    const videoPreviewFrame = document.getElementById('videoPreviewFrame');
    const videoPreviewTitle = document.getElementById('videoPreviewTitle');
    const articleEditForm = document.getElementById('articleEditForm');
    const articleEditId = document.getElementById('articleEditId');
    const articleEditTitle = document.getElementById('articleEditTitle');
    const articleEditContent = document.getElementById('articleEditContent');

    const adminFeedback = document.getElementById('adminFeedback');
    const questionFeedback = document.getElementById('questionFeedback');
    const articleFeedback = document.getElementById('articleFeedback');
    const classFeedback = document.getElementById('classFeedback');
    const categoryFeedback = document.getElementById('categoryFeedback');
    const videoFeedback = document.getElementById('videoFeedback');

    const categoryModalFeedback = document.getElementById('categoryModalFeedback');
    const videoModalFeedback = document.getElementById('videoModalFeedback');
    const classSessionModalFeedback = document.getElementById('classSessionModalFeedback');
    const classSessionEditModalFeedback = document.getElementById('classSessionEditModalFeedback');
    const articleEditModalFeedback = document.getElementById('articleEditModalFeedback');
    const deleteConfirmMessage = document.getElementById('deleteConfirmMessage');
    const deleteConfirmButton = document.getElementById('deleteConfirmButton');
    const categoryModalElement = document.getElementById('categoryModal');
    const videoModalElement = document.getElementById('videoModal');
    const classSessionModalElement = document.getElementById('classSessionModal');
    const classSessionEditModalElement = document.getElementById('classSessionEditModal');
    const classSessionUsersModalElement = document.getElementById('classSessionUsersModal');
    const videoPreviewModalElement = document.getElementById('videoPreviewModal');
    const articleEditModalElement = document.getElementById('articleEditModal');
    const deleteConfirmModalElement = document.getElementById('deleteConfirmModal');

    const hasBootstrapModal = Boolean(window.bootstrap && window.bootstrap.Modal);
    const categoryModal = hasBootstrapModal && categoryModalElement
      ? window.bootstrap.Modal.getOrCreateInstance(categoryModalElement)
      : null;
    const videoModal = hasBootstrapModal && videoModalElement
      ? window.bootstrap.Modal.getOrCreateInstance(videoModalElement)
      : null;
    const classSessionModal = hasBootstrapModal && classSessionModalElement
      ? window.bootstrap.Modal.getOrCreateInstance(classSessionModalElement)
      : null;
    const classSessionEditModal = hasBootstrapModal && classSessionEditModalElement
      ? window.bootstrap.Modal.getOrCreateInstance(classSessionEditModalElement)
      : null;
    const classSessionUsersModal = hasBootstrapModal && classSessionUsersModalElement
      ? window.bootstrap.Modal.getOrCreateInstance(classSessionUsersModalElement)
      : null;
    const videoPreviewModal = hasBootstrapModal && videoPreviewModalElement
      ? window.bootstrap.Modal.getOrCreateInstance(videoPreviewModalElement)
      : null;
    const articleEditModal = hasBootstrapModal && articleEditModalElement
      ? window.bootstrap.Modal.getOrCreateInstance(articleEditModalElement)
      : null;
    const deleteConfirmModal = hasBootstrapModal && deleteConfirmModalElement
      ? window.bootstrap.Modal.getOrCreateInstance(deleteConfirmModalElement)
      : null;

    const state = {
      categories: [],
      videos: [],
      admins: [],
      questions: [],
      articles: [],
      classSessions: [],
      activeCategory: '',
    };

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function showFeedback(target, message, type) {
      if (!target) {
        return;
      }

      target.classList.remove('d-none', 'text-success', 'text-danger');
      target.classList.add(type === 'error' ? 'text-danger' : 'text-success');
      target.textContent = message;
    }

    function clearFeedback(target) {
      if (!target) {
        return;
      }

      target.classList.add('d-none');
      target.textContent = '';
    }

    function hideModal(modalInstance, modalElement) {
      if (modalInstance) {
        modalInstance.hide();
        return;
      }

      if (!modalElement) {
        return;
      }

      modalElement.classList.remove('show');
      modalElement.setAttribute('aria-hidden', 'true');
      modalElement.style.display = 'none';
      document.body.classList.remove('modal-open');
      document.querySelectorAll('.modal-backdrop').forEach((backdrop) => backdrop.remove());
    }

    function showModal(modalInstance, modalElement) {
      if (modalInstance) {
        modalInstance.show();
        return;
      }

      if (!modalElement) {
        return;
      }

      modalElement.classList.add('show');
      modalElement.setAttribute('aria-modal', 'true');
      modalElement.setAttribute('role', 'dialog');
      modalElement.style.display = 'block';
      document.body.classList.add('modal-open');
    }

    function confirmDelete(message) {
      if (!deleteConfirmModalElement || !deleteConfirmButton || !deleteConfirmMessage) {
        return Promise.resolve(window.confirm(message));
      }

      return new Promise((resolve) => {
        let isResolved = false;

        const cleanup = () => {
          deleteConfirmButton.removeEventListener('click', onConfirm);
          deleteConfirmModalElement.removeEventListener('hidden.bs.modal', onHidden);
        };

        const onConfirm = () => {
          if (isResolved) {
            return;
          }

          isResolved = true;
          cleanup();
          hideModal(deleteConfirmModal, deleteConfirmModalElement);
          resolve(true);
        };

        const onHidden = () => {
          if (isResolved) {
            return;
          }

          isResolved = true;
          cleanup();
          resolve(false);
        };

        deleteConfirmMessage.textContent = message;
        deleteConfirmButton.addEventListener('click', onConfirm);
        deleteConfirmModalElement.addEventListener('hidden.bs.modal', onHidden);
        showModal(deleteConfirmModal, deleteConfirmModalElement);
      });
    }

    async function request(url, options) {
      const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || 'Request failed.');
      }

      return payload;
    }

    function renderCategoryOptions() {
      const options = state.categories
        .map((category) => `<option value="${category._id}">${escapeHtml(category.title)}</option>`)
        .join('');

      categoryFilter.innerHTML = `<option value="">All categories</option>${options}`;
      categorySelect.innerHTML = `<option value="">Select category</option>${options}`;

      if (state.activeCategory) {
        categoryFilter.value = state.activeCategory;
      }
    }

    function renderCategories() {
      if (!state.categories.length) {
        categoryList.innerHTML = '<li class="text-muted">No categories added yet.</li>';
        return;
      }

      categoryList.innerHTML = state.categories
        .map(
          (category) => `
            <li class="admin-item">
              <div>
                <p class="admin-item-title">${escapeHtml(category.title)}</p>
                <small class="text-muted">${category.videoCount} video(s)</small>
              </div>
              <button class="btn btn-sm btn-outline-danger" data-action="delete-category" data-id="${category._id}">
                Delete
              </button>
            </li>
          `
        )
        .join('');
    }

    function renderVideos() {
      if (!state.videos.length) {
        videoList.innerHTML = '<li class="text-muted">No videos found for this selection.</li>';
        return;
      }

      videoList.innerHTML = state.videos
        .map(
          (video) => `
            <li class="admin-item">
              <div>
                <p class="admin-item-title">${escapeHtml(video.title)}</p>
                <small class="text-muted">${escapeHtml(video.category ? video.category.title : 'No category')}</small>
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-secondary" data-action="preview-video" data-id="${video._id}">
                  Preview
                </button>
                <button class="btn btn-sm btn-outline-danger" data-action="delete-video" data-id="${video._id}">
                  Delete
                </button>
              </div>
            </li>
          `
        )
        .join('');
    }

    function renderAdmins() {
      if (!state.admins.length) {
        adminList.innerHTML = '<li class="text-muted">No admins found.</li>';
        return;
      }

      adminList.innerHTML = state.admins
        .map(
          (admin) => `
            <li class="admin-item">
              <div>
                <p class="admin-item-title">${escapeHtml(admin.username)}</p>
              </div>
              <button class="btn btn-sm btn-outline-danger" data-action="delete-admin" data-id="${admin._id}">
                Delete
              </button>
            </li>
          `
        )
        .join('');
    }

    function renderQuestions() {
      if (!state.questions.length) {
        questionList.innerHTML = '<li class="text-muted">No questions found.</li>';
        return;
      }

      questionList.innerHTML = state.questions
        .map(
          (question) => `
            <li class="admin-item">
              <div>
                <p class="admin-item-title">${escapeHtml(question.question)}</p>
                <small class="text-muted">${escapeHtml(question.username)} | ${question.isAnswered ? 'Answered' : 'Pending'}</small>
              </div>
              <button class="btn btn-sm btn-outline-danger" data-action="delete-question" data-id="${question._id}">
                Delete
              </button>
            </li>
          `
        )
        .join('');
    }

    function renderArticles() {
      if (!state.articles.length) {
        articleList.innerHTML = '<li class="text-muted">No articles found.</li>';
        return;
      }

      articleList.innerHTML = state.articles
        .map(
          (article) => `
            <li class="admin-item">
              <div>
                <p class="admin-item-title">${escapeHtml(article.title)}</p>
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-secondary" data-action="edit-article" data-id="${article._id}">
                  Edit
                </button>
                <button class="btn btn-sm btn-outline-danger" data-action="delete-article" data-id="${article._id}">
                  Delete
                </button>
              </div>
            </li>
          `
        )
        .join('');
    }

    function renderClassSessions() {
      if (!state.classSessions.length) {
        classList.innerHTML = '<li class="text-muted">No class sessions found.</li>';
        return;
      }

      classList.innerHTML = state.classSessions
        .map(
          (session) => `
            <li class="admin-item">
              <div>
                <p class="admin-item-title">${escapeHtml(session.title)}</p>
                <small class="text-muted">${session.registrationCount} registration(s)</small>
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-secondary" data-action="view-class-session" data-id="${session._id}">
                  View
                </button>
                <button class="btn btn-sm btn-outline-primary" data-action="edit-class-session" data-id="${session._id}">
                  Edit
                </button>
                <button class="btn btn-sm btn-outline-danger" data-action="delete-class-session" data-id="${session._id}">
                  Delete
                </button>
              </div>
            </li>
          `
        )
        .join('');
    }

    async function loadCategories() {
      const payload = await request('/api/admin/video-categories');
      state.categories = payload.categories || [];
      renderCategories();
      renderCategoryOptions();
    }

    async function loadVideos() {
      const query = state.activeCategory ? `?category=${encodeURIComponent(state.activeCategory)}` : '';
      const payload = await request(`/api/admin/videos${query}`);
      state.videos = payload.videos || [];
      renderVideos();
    }

    async function loadAdmins() {
      const payload = await request('/api/admin/admins');
      state.admins = payload.admins || [];
      renderAdmins();
    }

    async function loadQuestions() {
      const payload = await request('/api/admin/questions');
      state.questions = payload.questions || [];
      renderQuestions();
    }

    async function loadArticles() {
      const payload = await request('/api/admin/articles');
      state.articles = payload.articles || [];
      renderArticles();
    }

    async function loadClassSessions() {
      const payload = await request('/api/admin/class-sessions');
      state.classSessions = payload.classSessions || [];
      renderClassSessions();
    }

    async function refreshAll() {
      await Promise.all([
        loadCategories(),
        loadVideos(),
        loadAdmins(),
        loadQuestions(),
        loadArticles(),
        loadClassSessions(),
      ]);
    }

    categoryForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      clearFeedback(categoryModalFeedback);
      clearFeedback(categoryFeedback);

      const formData = new FormData(categoryForm);
      const title = (formData.get('title') || '').toString().trim();

      if (!title) {
        showFeedback(categoryModalFeedback, 'Category title is required.', 'error');
        return;
      }

      try {
        await request('/api/admin/video-categories', {
          method: 'POST',
          body: JSON.stringify({ title }),
        });

        categoryForm.reset();
        hideModal(categoryModal, categoryModalElement);

        await loadCategories();
        await loadVideos();
        showFeedback(categoryFeedback, 'Category added successfully.', 'success');
      } catch (error) {
        showFeedback(categoryModalFeedback, error.message, 'error');
      }
    });

    videoForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      clearFeedback(videoModalFeedback);
      clearFeedback(videoFeedback);

      const formData = new FormData(videoForm);
      const payload = {
        title: (formData.get('title') || '').toString().trim(),
        category: (formData.get('category') || '').toString(),
        youtubeUrl: (formData.get('youtubeUrl') || '').toString().trim(),
      };

      if (!payload.title || !payload.category || !payload.youtubeUrl) {
        showFeedback(videoModalFeedback, 'All fields are required.', 'error');
        return;
      }

      try {
        await request('/api/admin/videos', {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        videoForm.reset();
        hideModal(videoModal, videoModalElement);

        await loadCategories();
        await loadVideos();
        showFeedback(videoFeedback, 'Video added successfully.', 'success');
      } catch (error) {
        showFeedback(videoModalFeedback, error.message, 'error');
      }
    });

    if (classSessionForm) {
      classSessionForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearFeedback(classSessionModalFeedback);
        clearFeedback(classFeedback);

        const title = (classSessionTitle.value || '').trim();
        if (!title) {
          showFeedback(classSessionModalFeedback, 'Session title is required.', 'error');
          return;
        }

        try {
          await request('/api/admin/class-sessions', {
            method: 'POST',
            body: JSON.stringify({ title }),
          });

          classSessionForm.reset();
          hideModal(classSessionModal, classSessionModalElement);
          await loadClassSessions();
          showFeedback(classFeedback, 'Session added successfully.', 'success');
        } catch (error) {
          showFeedback(classSessionModalFeedback, error.message, 'error');
        }
      });
    }

    if (classSessionEditForm) {
      classSessionEditForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearFeedback(classSessionEditModalFeedback);
        clearFeedback(classFeedback);

        const sessionId = (classSessionEditId.value || '').trim();
        const title = (classSessionEditTitle.value || '').trim();

        if (!sessionId || !title) {
          showFeedback(classSessionEditModalFeedback, 'Session title is required.', 'error');
          return;
        }

        try {
          await request(`/api/admin/class-sessions/${sessionId}`, {
            method: 'PUT',
            body: JSON.stringify({ title }),
          });

          classSessionEditForm.reset();
          hideModal(classSessionEditModal, classSessionEditModalElement);
          await loadClassSessions();
          showFeedback(classFeedback, 'Session updated successfully.', 'success');
        } catch (error) {
          showFeedback(classSessionEditModalFeedback, error.message, 'error');
        }
      });
    }

    if (articleEditForm) {
      articleEditForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearFeedback(articleEditModalFeedback);
        clearFeedback(articleFeedback);

        const id = (articleEditId.value || '').trim();
        const title = (articleEditTitle.value || '').trim();
        const content = (articleEditContent.value || '').trim();

        if (!id || !title || !content) {
          showFeedback(articleEditModalFeedback, 'Title and content are required.', 'error');
          return;
        }

        try {
          await request(`/api/admin/articles/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ title, content }),
          });

          hideModal(articleEditModal, articleEditModalElement);
          articleEditForm.reset();
          await loadArticles();
          showFeedback(articleFeedback, 'Article updated successfully.', 'success');
        } catch (error) {
          showFeedback(articleEditModalFeedback, error.message, 'error');
        }
      });
    }

    categoryFilter.addEventListener('change', async (event) => {
      state.activeCategory = event.target.value;
      clearFeedback(videoFeedback);
      await loadVideos();
    });

    adminList.addEventListener('click', async (event) => {
      const button = event.target.closest('[data-action="delete-admin"]');
      if (!button) {
        return;
      }

      const { id } = button.dataset;
      if (!id || !(await confirmDelete('Delete this admin account?'))) {
        return;
      }

      try {
        await request(`/api/admin/admins/${id}`, { method: 'DELETE' });
        await loadAdmins();
        showFeedback(adminFeedback, 'Admin deleted successfully.', 'success');
      } catch (error) {
        showFeedback(adminFeedback, error.message, 'error');
      }
    });

    questionList.addEventListener('click', async (event) => {
      const button = event.target.closest('[data-action="delete-question"]');
      if (!button) {
        return;
      }

      const { id } = button.dataset;
      if (!id || !(await confirmDelete('Delete this question?'))) {
        return;
      }

      try {
        await request(`/api/admin/questions/${id}`, { method: 'DELETE' });
        await loadQuestions();
        showFeedback(questionFeedback, 'Question deleted successfully.', 'success');
      } catch (error) {
        showFeedback(questionFeedback, error.message, 'error');
      }
    });

    articleList.addEventListener('click', async (event) => {
      const editButton = event.target.closest('[data-action="edit-article"]');
      if (editButton) {
        const { id } = editButton.dataset;
        if (!id || !articleEditForm) {
          return;
        }

        clearFeedback(articleEditModalFeedback);

        try {
          const payload = await request(`/api/admin/articles/${id}`);
          const article = payload.article;
          articleEditId.value = article._id;
          articleEditTitle.value = article.title || '';
          articleEditContent.value = article.content || '';
          showModal(articleEditModal, articleEditModalElement);
        } catch (error) {
          showFeedback(articleFeedback, error.message, 'error');
        }
        return;
      }

      const button = event.target.closest('[data-action="delete-article"]');
      if (!button) {
        return;
      }

      const { id } = button.dataset;
      if (!id || !(await confirmDelete('Delete this article?'))) {
        return;
      }

      try {
        await request(`/api/admin/articles/${id}`, { method: 'DELETE' });
        await loadArticles();
        showFeedback(articleFeedback, 'Article deleted successfully.', 'success');
      } catch (error) {
        showFeedback(articleFeedback, error.message, 'error');
      }
    });

    classList.addEventListener('click', async (event) => {
      const viewButton = event.target.closest('[data-action="view-class-session"]');
      if (viewButton) {
        const { id } = viewButton.dataset;
        if (!id || !classSessionUsersList || !classSessionUsersTitle) {
          return;
        }

        classSessionUsersTitle.textContent = 'Session Users';
        classSessionUsersList.innerHTML = '<li class="text-muted">Loading users...</li>';
        showModal(classSessionUsersModal, classSessionUsersModalElement);

        try {
          const payload = await request(`/api/admin/class-sessions/${id}/users`);
          classSessionUsersTitle.textContent = payload.classSession.title;

          if (!payload.users || !payload.users.length) {
            classSessionUsersList.innerHTML = '<li class="text-muted">No users registered under this session yet.</li>';
            return;
          }

          classSessionUsersList.innerHTML = payload.users
            .map(
              (user) => `
                <li class="admin-item">
                  <div>
                    <p class="admin-item-title">${escapeHtml(user.username)}</p>
                    <small class="text-muted">Phone: ${escapeHtml(user.phoneNumber || 'N/A')} | MoMo: ${escapeHtml(user.momoReferenceName || 'N/A')}</small>
                  </div>
                  <span class="badge ${user.accessCodeAssigned ? 'text-bg-success' : 'text-bg-secondary'}">
                    ${user.accessCodeAssigned ? 'Code Assigned' : 'Pending Code'}
                  </span>
                </li>
              `
            )
            .join('');
        } catch (error) {
          classSessionUsersList.innerHTML = `<li class="text-danger">${escapeHtml(error.message)}</li>`;
        }

        return;
      }

      const editButton = event.target.closest('[data-action="edit-class-session"]');
      if (editButton) {
        const { id } = editButton.dataset;
        const session = state.classSessions.find((item) => String(item._id) === String(id));

        if (!session || !classSessionEditId || !classSessionEditTitle) {
          showFeedback(classFeedback, 'Unable to load session for editing.', 'error');
          return;
        }

        clearFeedback(classSessionEditModalFeedback);
        classSessionEditId.value = session._id;
        classSessionEditTitle.value = session.title || '';
        showModal(classSessionEditModal, classSessionEditModalElement);
        return;
      }

      const button = event.target.closest('[data-action="delete-class-session"]');
      if (!button) {
        return;
      }

      const { id } = button.dataset;
      if (!id || !(await confirmDelete('Delete this class session and related registrations?'))) {
        return;
      }

      try {
        await request(`/api/admin/class-sessions/${id}`, { method: 'DELETE' });
        await loadClassSessions();
        showFeedback(classFeedback, 'Class session deleted successfully.', 'success');
      } catch (error) {
        showFeedback(classFeedback, error.message, 'error');
      }
    });

    categoryList.addEventListener('click', async (event) => {
      const button = event.target.closest('[data-action="delete-category"]');
      if (!button) {
        return;
      }

      const { id } = button.dataset;
      if (!id || !(await confirmDelete('Delete this category and all videos inside it?'))) {
        return;
      }

      try {
        await request(`/api/admin/video-categories/${id}`, { method: 'DELETE' });
        if (state.activeCategory === id) {
          state.activeCategory = '';
        }
        await loadCategories();
        await loadVideos();
        showFeedback(categoryFeedback, 'Category deleted successfully.', 'success');
      } catch (error) {
        showFeedback(categoryFeedback, error.message, 'error');
      }
    });

    videoList.addEventListener('click', async (event) => {
      const previewButton = event.target.closest('[data-action="preview-video"]');
      if (previewButton) {
        const { id } = previewButton.dataset;
        const video = state.videos.find((item) => String(item._id) === String(id));

        if (!video || !videoPreviewFrame || !videoPreviewTitle) {
          showFeedback(videoFeedback, 'Unable to preview this video.', 'error');
          return;
        }

        videoPreviewTitle.textContent = video.title || 'Video Preview';
        videoPreviewFrame.src = video.youtubeUrl;
        showModal(videoPreviewModal, videoPreviewModalElement);
        return;
      }

      const button = event.target.closest('[data-action="delete-video"]');
      if (!button) {
        return;
      }

      const { id } = button.dataset;
      if (!id || !(await confirmDelete('Delete this video?'))) {
        return;
      }

      try {
        await request(`/api/admin/videos/${id}`, { method: 'DELETE' });
        await loadCategories();
        await loadVideos();
        showFeedback(videoFeedback, 'Video deleted successfully.', 'success');
      } catch (error) {
        showFeedback(videoFeedback, error.message, 'error');
      }
    });

    if (videoPreviewModalElement && videoPreviewFrame) {
      videoPreviewModalElement.addEventListener('hidden.bs.modal', () => {
        videoPreviewFrame.src = '';
      });
    }

    refreshAll().catch((error) => {
      const message = escapeHtml(error.message);
      adminList.innerHTML = `<li class="text-danger">${message}</li>`;
      questionList.innerHTML = `<li class="text-danger">${message}</li>`;
      articleList.innerHTML = `<li class="text-danger">${message}</li>`;
      classList.innerHTML = `<li class="text-danger">${message}</li>`;
      categoryList.innerHTML = `<li class="text-danger">${message}</li>`;
      videoList.innerHTML = `<li class="text-danger">${message}</li>`;
    });
  }

  if (document.readyState === 'complete') {
    initAdminDashboard();
  } else {
    window.addEventListener('load', initAdminDashboard, { once: true });
  }
})();
