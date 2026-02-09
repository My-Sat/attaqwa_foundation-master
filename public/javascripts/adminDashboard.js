(function () {
  function initAdminDashboard() {
    const categoryList = document.getElementById('categoryList');
    const videoList = document.getElementById('videoList');
    const adminList = document.getElementById('adminList');
    const questionList = document.getElementById('questionList');
    const answerQuestionsBtn = document.getElementById('answerQuestionsBtn');
    const articleList = document.getElementById('articleList');
    const classList = document.getElementById('classList');
    const liveClassStatusElement = document.getElementById('liveClassStatus');
    const endLiveClassBtn = document.getElementById('endLiveClassBtn');
    const joinLiveClassBtn = document.getElementById('joinLiveClassBtn');
    const liveStreamScheduleStatusElement = document.getElementById('liveStreamScheduleStatus');
    const clearLiveStreamScheduleBtn = document.getElementById('clearLiveStreamScheduleBtn');

    if (!categoryList || !videoList || !adminList || !questionList || !articleList || !classList) {
      return;
    }

    const categoryFilter = document.getElementById('videoCategoryFilter');
    const categorySelect = document.getElementById('videoCategory');
    const categoryForm = document.getElementById('categoryForm');
    const categoryEditForm = document.getElementById('categoryEditForm');
    const categoryEditId = document.getElementById('categoryEditId');
    const categoryEditTitle = document.getElementById('categoryEditTitle');
    const videoForm = document.getElementById('videoForm');
    const classSessionForm = document.getElementById('classSessionForm');
    const classSessionTitle = document.getElementById('classSessionTitle');
    const classSessionPrice = document.getElementById('classSessionPrice');
    const classSessionStartDate = document.getElementById('classSessionStartDate');
    const classSessionStartTime = document.getElementById('classSessionStartTime');
    const classSessionDurationMinutes = document.getElementById('classSessionDurationMinutes');
    const classSessionFrequency = document.getElementById('classSessionFrequency');
    const classSessionWeekDaysGroup = document.getElementById('classSessionWeekDaysGroup');
    const classSessionWeekDayInputs = classSessionWeekDaysGroup
      ? Array.from(classSessionWeekDaysGroup.querySelectorAll('input[name="weekDays"]'))
      : [];
    const classSessionEditForm = document.getElementById('classSessionEditForm');
    const classSessionEditId = document.getElementById('classSessionEditId');
    const classSessionEditTitle = document.getElementById('classSessionEditTitle');
    const classSessionEditPrice = document.getElementById('classSessionEditPrice');
    const classSessionEditStartDate = document.getElementById('classSessionEditStartDate');
    const classSessionEditStartTime = document.getElementById('classSessionEditStartTime');
    const classSessionEditDurationMinutes = document.getElementById('classSessionEditDurationMinutes');
    const classSessionEditFrequency = document.getElementById('classSessionEditFrequency');
    const classSessionEditWeekDaysGroup = document.getElementById('classSessionEditWeekDaysGroup');
    const classSessionEditWeekDayInputs = classSessionEditWeekDaysGroup
      ? Array.from(classSessionEditWeekDaysGroup.querySelectorAll('input[name="weekDays"]'))
      : [];
    const liveStreamScheduleForm = document.getElementById('liveStreamScheduleForm');
    const liveStreamStartsAt = document.getElementById('liveStreamStartsAt');
    const liveStreamNote = document.getElementById('liveStreamNote');
    const classSessionUsersTitle = document.getElementById('classSessionUsersTitle');
    const classSessionUsersList = document.getElementById('classSessionUsersList');
    const videoPreviewFrame = document.getElementById('videoPreviewFrame');
    const videoPreviewTitle = document.getElementById('videoPreviewTitle');
    const questionAnswerForm = document.getElementById('questionAnswerForm');
    const questionAnswerId = document.getElementById('questionAnswerId');
    const questionAnswerSelect = document.getElementById('questionAnswerSelect');
    const questionAnswerSelectHint = document.getElementById('questionAnswerSelectHint');
    const questionAnswerText = document.getElementById('questionAnswerText');
    const questionAnswerInput = document.getElementById('questionAnswerInput');

    const adminFeedback = document.getElementById('adminFeedback');
    const questionFeedback = document.getElementById('questionFeedback');
    const articleFeedback = document.getElementById('articleFeedback');
    const classFeedback = document.getElementById('classFeedback');
    const categoryFeedback = document.getElementById('categoryFeedback');
    const videoFeedback = document.getElementById('videoFeedback');

    const categoryModalFeedback = document.getElementById('categoryModalFeedback');
    const categoryEditModalFeedback = document.getElementById('categoryEditModalFeedback');
    const videoModalFeedback = document.getElementById('videoModalFeedback');
    const classSessionModalFeedback = document.getElementById('classSessionModalFeedback');
    const classSessionEditModalFeedback = document.getElementById('classSessionEditModalFeedback');
    const liveStreamScheduleModalFeedback = document.getElementById('liveStreamScheduleModalFeedback');
    const questionAnswerModalFeedback = document.getElementById('questionAnswerModalFeedback');
    const deleteConfirmModalLabel = document.getElementById('deleteConfirmModalLabel');
    const deleteConfirmMessage = document.getElementById('deleteConfirmMessage');
    const deleteConfirmButton = document.getElementById('deleteConfirmButton');
    const categoryModalElement = document.getElementById('categoryModal');
    const categoryEditModalElement = document.getElementById('categoryEditModal');
    const videoModalElement = document.getElementById('videoModal');
    const classSessionModalElement = document.getElementById('classSessionModal');
    const classSessionEditModalElement = document.getElementById('classSessionEditModal');
    const liveStreamScheduleModalElement = document.getElementById('liveStreamScheduleModal');
    const classSessionUsersModalElement = document.getElementById('classSessionUsersModal');
    const videoPreviewModalElement = document.getElementById('videoPreviewModal');
    const questionAnswerModalElement = document.getElementById('questionAnswerModal');
    const deleteConfirmModalElement = document.getElementById('deleteConfirmModal');

    const hasBootstrapModal = Boolean(window.bootstrap && window.bootstrap.Modal);
    const categoryModal = hasBootstrapModal && categoryModalElement
      ? window.bootstrap.Modal.getOrCreateInstance(categoryModalElement)
      : null;
    const categoryEditModal = hasBootstrapModal && categoryEditModalElement
      ? window.bootstrap.Modal.getOrCreateInstance(categoryEditModalElement)
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
    const liveStreamScheduleModal = hasBootstrapModal && liveStreamScheduleModalElement
      ? window.bootstrap.Modal.getOrCreateInstance(liveStreamScheduleModalElement)
      : null;
    const classSessionUsersModal = hasBootstrapModal && classSessionUsersModalElement
      ? window.bootstrap.Modal.getOrCreateInstance(classSessionUsersModalElement)
      : null;
    const videoPreviewModal = hasBootstrapModal && videoPreviewModalElement
      ? window.bootstrap.Modal.getOrCreateInstance(videoPreviewModalElement)
      : null;
    const questionAnswerModal = hasBootstrapModal && questionAnswerModalElement
      ? window.bootstrap.Modal.getOrCreateInstance(questionAnswerModalElement)
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
      liveClassStatus: {
        isLive: false,
        activeSession: null,
        startedAt: null,
      },
      liveStreamSchedule: {
        startsAt: null,
        note: '',
        updatedAt: null,
      },
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

    function formatDateTime(value) {
      if (!value) {
        return 'N/A';
      }

      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return 'N/A';
      }

      return date.toLocaleString();
    }

    function showFeedback(target, message, type) {
      if (!target) {
        return;
      }

      target.classList.remove('d-none', 'text-success', 'text-danger');
      target.classList.add(type === 'error' ? 'text-danger' : 'text-success');
      target.textContent = message;
    }

    function formatMoney(value) {
      const amount = Number(value);
      if (!Number.isFinite(amount)) {
        return 'GHC 0.00';
      }
      return `GHC ${amount.toFixed(2)}`;
    }

    function toDateInputValue(value) {
      if (!value) {
        return '';
      }

      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return '';
      }

      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }

    function normalizeWeekDays(values) {
      const source = Array.isArray(values) ? values : [values];
      const parsed = source
        .map((item) => Number(item))
        .filter((item) => Number.isInteger(item) && item >= 0 && item <= 6);
      return Array.from(new Set(parsed)).sort((a, b) => a - b);
    }

    function setWeekDayInputs(inputs, days) {
      const selected = new Set(normalizeWeekDays(days));
      inputs.forEach((input) => {
        input.checked = selected.has(Number(input.value));
      });
    }

    function toggleWeekDaysGroup(groupElement, frequencyValue) {
      if (!groupElement) {
        return;
      }
      const isWeekly = String(frequencyValue || '').trim().toLowerCase() !== 'daily';
      if (isWeekly) {
        groupElement.classList.remove('d-none');
      } else {
        groupElement.classList.add('d-none');
      }
    }

    function getSelectedWeekDays(inputs) {
      return inputs
        .filter((input) => input.checked)
        .map((input) => Number(input.value));
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

    function confirmDelete(message, options) {
      const confirmText = options && options.confirmText ? options.confirmText : 'Delete';
      const confirmVariant = options && options.confirmVariant ? options.confirmVariant : 'danger';
      const confirmTitle = options && options.confirmTitle ? options.confirmTitle : 'Confirm Delete';
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
        if (deleteConfirmModalLabel) {
          deleteConfirmModalLabel.textContent = confirmTitle;
        }
        deleteConfirmButton.textContent = confirmText;
        deleteConfirmButton.classList.remove('btn-danger', 'btn-primary', 'btn-warning', 'btn-success', 'btn-secondary');
        deleteConfirmButton.classList.add(`btn-${confirmVariant}`);
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
              <div class="dropdown">
                <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Category actions">
                  <i class="bi bi-three-dots-vertical"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li>
                    <button class="dropdown-item" data-action="edit-category" data-id="${category._id}">
                      Edit
                    </button>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <button class="dropdown-item text-danger" data-action="delete-category" data-id="${category._id}">
                      Delete
                    </button>
                  </li>
                </ul>
              </div>
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
              <div class="dropdown">
                <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Video actions">
                  <i class="bi bi-three-dots-vertical"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li>
                    <button class="dropdown-item" data-action="preview-video" data-id="${video._id}">
                      Preview
                    </button>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <button class="dropdown-item text-danger" data-action="delete-video" data-id="${video._id}">
                      Delete
                    </button>
                  </li>
                </ul>
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
                <small class="d-block text-muted">Answered by: ${escapeHtml(question.answeredByName || 'N/A')} at ${escapeHtml(formatDateTime(question.answeredAt))}</small>
                ${question.updatedByName || question.updatedAt
                  ? `<small class="d-block text-muted">Updated by: ${escapeHtml(question.updatedByName || 'N/A')} at ${escapeHtml(formatDateTime(question.updatedAt))}</small>`
                  : ''}
              </div>
              <div class="dropdown">
                <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Question actions">
                  <i class="bi bi-three-dots-vertical"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li>
                    <button class="dropdown-item" data-action="edit-answer" data-id="${question._id}">
                      Edit
                    </button>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <button class="dropdown-item text-danger" data-action="delete-question" data-id="${question._id}">
                      Delete
                    </button>
                  </li>
                </ul>
              </div>
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
                <small class="text-muted">${article.status === 'draft' ? 'Draft (private)' : 'Published'}</small>
              </div>
              <div class="dropdown">
                <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Article actions">
                  <i class="bi bi-three-dots-vertical"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li>
                    <a class="dropdown-item" href="/create_article/${article._id}">
                      Edit
                    </a>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <button class="dropdown-item text-danger" data-action="delete-article" data-id="${article._id}">
                      Delete
                    </button>
                  </li>
                </ul>
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
      const isAnyLive = Boolean(state.liveClassStatus && state.liveClassStatus.isLive);

      classList.innerHTML = state.classSessions
        .map(
          (session) => `
            <li class="admin-item">
              <div>
                <p class="admin-item-title">${escapeHtml(session.title)}</p>
                <small class="text-muted">${session.registrationCount} registration(s) | ${escapeHtml(formatMoney(session.price))}</small>
                <small class="d-block text-muted">${escapeHtml(session.scheduleSummary || 'Schedule not configured')}</small>
                <small class="d-block text-muted">Duration: ${escapeHtml(String(session.schedule && session.schedule.durationMinutes ? session.schedule.durationMinutes : 60))} min</small>
                ${session.isLiveActive ? '<small class="d-block text-success fw-bold">Live now</small>' : ''}
              </div>
              <div class="dropdown">
                <button
                  class="btn btn-sm btn-outline-secondary"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  aria-label="Class actions"
                >
                  <i class="bi bi-three-dots-vertical"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li>
                    <button class="dropdown-item ${session.isLiveActive ? 'text-success' : ''}" data-action="start-class-session" data-id="${session._id}" ${(isAnyLive || session.isLiveActive) ? 'disabled' : ''}>
                      ${session.isLiveActive ? 'Active' : 'Start'}
                    </button>
                  </li>
                  <li>
                    <button class="dropdown-item" data-action="view-class-session" data-id="${session._id}">
                      View
                    </button>
                  </li>
                  <li>
                    <button class="dropdown-item" data-action="edit-class-session" data-id="${session._id}">
                      Edit
                    </button>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <button class="dropdown-item text-danger" data-action="delete-class-session" data-id="${session._id}">
                      Delete
                    </button>
                  </li>
                </ul>
              </div>
            </li>
          `
        )
        .join('');
    }

    function renderLiveClassStatus() {
      if (!liveClassStatusElement) {
        return;
      }

      const status = state.liveClassStatus || { isLive: false, activeSession: null };
      if (!status.isLive || !status.activeSession) {
        liveClassStatusElement.textContent = 'Live class is currently not active.';
        if (endLiveClassBtn) {
          endLiveClassBtn.setAttribute('disabled', 'disabled');
        }
        if (joinLiveClassBtn) {
          joinLiveClassBtn.setAttribute('disabled', 'disabled');
        }
        return;
      }

      liveClassStatusElement.textContent = `Live now: ${status.activeSession.title} (started ${formatDateTime(status.startedAt)})`;
      if (endLiveClassBtn) {
        endLiveClassBtn.removeAttribute('disabled');
      }
      if (joinLiveClassBtn) {
        joinLiveClassBtn.removeAttribute('disabled');
      }
    }

    function toDatetimeLocalValue(value) {
      if (!value) {
        return '';
      }

      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return '';
      }

      const timezoneOffset = date.getTimezoneOffset() * 60000;
      return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
    }

    function renderLiveStreamScheduleStatus() {
      if (!liveStreamScheduleStatusElement) {
        return;
      }

      const schedule = state.liveStreamSchedule || {};
      if (!schedule.startsAt) {
        liveStreamScheduleStatusElement.textContent = 'No incoming live video for the moment.';
        if (clearLiveStreamScheduleBtn) {
          clearLiveStreamScheduleBtn.setAttribute('disabled', 'disabled');
        }
        if (liveStreamStartsAt) {
          liveStreamStartsAt.value = '';
        }
        if (liveStreamNote) {
          liveStreamNote.value = '';
        }
        return;
      }

      const startsAtText = formatDateTime(schedule.startsAt);
      const noteText = schedule.note ? ` | Note: ${schedule.note}` : '';
      liveStreamScheduleStatusElement.textContent = `Incoming live video at ${startsAtText}${noteText}`;
      if (clearLiveStreamScheduleBtn) {
        clearLiveStreamScheduleBtn.removeAttribute('disabled');
      }
      if (liveStreamStartsAt) {
        liveStreamStartsAt.value = toDatetimeLocalValue(schedule.startsAt);
      }
      if (liveStreamNote) {
        liveStreamNote.value = schedule.note || '';
      }
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

    function getQuestionById(id) {
      return state.questions.find((item) => String(item._id) === String(id));
    }

    function syncQuestionAnswerFormById(id) {
      const question = getQuestionById(id);
      if (!question || !questionAnswerId || !questionAnswerText || !questionAnswerInput) {
        return false;
      }

      questionAnswerId.value = question._id;
      questionAnswerText.value = question.question || '';
      questionAnswerInput.value = question.answer || '';
      return true;
    }

    function populateQuestionSelector(options) {
      const includeOnlyUnanswered = Boolean(options && options.includeOnlyUnanswered);
      const selectedId = options && options.selectedId ? options.selectedId : '';
      const sourceList = includeOnlyUnanswered
        ? state.questions.filter((item) => !item.isAnswered)
        : state.questions.slice();

      if (!questionAnswerSelect || !sourceList.length) {
        return null;
      }

      questionAnswerSelect.innerHTML = sourceList
        .map((question) => {
          const shortQuestion = (question.question || '').trim();
          const label = shortQuestion.length > 85 ? `${shortQuestion.slice(0, 82)}...` : shortQuestion;
          return `<option value="${question._id}">${escapeHtml(label)}</option>`;
        })
        .join('');

      if (selectedId && sourceList.some((item) => String(item._id) === String(selectedId))) {
        questionAnswerSelect.value = selectedId;
      }

      const resolvedId = questionAnswerSelect.value || sourceList[0]._id;
      questionAnswerSelect.value = resolvedId;

      if (questionAnswerSelectHint) {
        questionAnswerSelectHint.textContent = includeOnlyUnanswered
          ? `${sourceList.length} unanswered question(s) pending.`
          : `${sourceList.length} question(s) available.`;
      }

      return resolvedId;
    }

    function openQuestionAnswerEditor(options) {
      if (!questionAnswerForm || !questionAnswerId || !questionAnswerText || !questionAnswerInput) {
        showFeedback(questionFeedback, 'Unable to load question answer editor.', 'error');
        return;
      }

      const resolvedId = populateQuestionSelector(options);
      if (!resolvedId) {
        showFeedback(questionFeedback, 'No questions available to answer.', 'error');
        return;
      }

      if (!syncQuestionAnswerFormById(resolvedId)) {
        showFeedback(questionFeedback, 'Unable to load selected question.', 'error');
        return;
      }

      clearFeedback(questionAnswerModalFeedback);
      showModal(questionAnswerModal, questionAnswerModalElement);
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

    async function loadLiveClassStatus() {
      const payload = await request('/api/admin/live-class/status');
      state.liveClassStatus = {
        isLive: Boolean(payload.isLive),
        activeSession: payload.activeSession || null,
        startedAt: payload.startedAt || null,
      };
      renderLiveClassStatus();
      renderClassSessions();
    }

    async function loadLiveStreamSchedule() {
      const payload = await request('/api/admin/live-stream-schedule');
      const schedule = payload && payload.schedule ? payload.schedule : {};
      state.liveStreamSchedule = {
        startsAt: schedule.startsAt || null,
        note: schedule.note || '',
        updatedAt: schedule.updatedAt || null,
      };
      renderLiveStreamScheduleStatus();
    }

    async function refreshAll() {
      await Promise.all([
        loadCategories(),
        loadVideos(),
        loadAdmins(),
        loadQuestions(),
        loadArticles(),
        loadLiveClassStatus(),
        loadLiveStreamSchedule(),
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

    if (categoryEditForm) {
      categoryEditForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearFeedback(categoryEditModalFeedback);
        clearFeedback(categoryFeedback);

        const categoryId = (categoryEditId.value || '').trim();
        const title = (categoryEditTitle.value || '').trim();

        if (!categoryId || !title) {
          showFeedback(categoryEditModalFeedback, 'Category title is required.', 'error');
          return;
        }

        try {
          await request(`/api/admin/video-categories/${categoryId}`, {
            method: 'PUT',
            body: JSON.stringify({ title }),
          });

          categoryEditForm.reset();
          hideModal(categoryEditModal, categoryEditModalElement);
          await loadCategories();
          await loadVideos();
          showFeedback(categoryFeedback, 'Category updated successfully.', 'success');
        } catch (error) {
          showFeedback(categoryEditModalFeedback, error.message, 'error');
        }
      });
    }

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

    function collectClassSessionPayload(options) {
      const mode = options && options.mode === 'edit' ? 'edit' : 'create';
      const titleInput = mode === 'edit' ? classSessionEditTitle : classSessionTitle;
      const priceInput = mode === 'edit' ? classSessionEditPrice : classSessionPrice;
      const startDateInput = mode === 'edit' ? classSessionEditStartDate : classSessionStartDate;
      const startTimeInput = mode === 'edit' ? classSessionEditStartTime : classSessionStartTime;
      const durationInput = mode === 'edit' ? classSessionEditDurationMinutes : classSessionDurationMinutes;
      const frequencyInput = mode === 'edit' ? classSessionEditFrequency : classSessionFrequency;
      const weekDayInputs = mode === 'edit' ? classSessionEditWeekDayInputs : classSessionWeekDayInputs;

      const title = (titleInput && titleInput.value ? titleInput.value : '').trim();
      const price = priceInput && priceInput.value ? Number(priceInput.value) : NaN;
      const scheduleStartDate = (startDateInput && startDateInput.value ? startDateInput.value : '').trim();
      const scheduleStartTime = (startTimeInput && startTimeInput.value ? startTimeInput.value : '').trim();
      const durationMinutes = durationInput && durationInput.value ? Number(durationInput.value) : NaN;
      const frequency = (frequencyInput && frequencyInput.value ? frequencyInput.value : 'weekly').trim().toLowerCase() === 'daily'
        ? 'daily'
        : 'weekly';
      const weekDays = normalizeWeekDays(getSelectedWeekDays(weekDayInputs));

      if (!title) {
        return { error: 'Session title is required.' };
      }
      if (!Number.isFinite(price) || price < 0) {
        return { error: 'Session price must be a valid number (0 or higher).' };
      }
      if (!scheduleStartDate) {
        return { error: 'Session start date is required.' };
      }
      if (!scheduleStartTime) {
        return { error: 'Session start time is required.' };
      }
      if (!Number.isFinite(durationMinutes) || durationMinutes < 15 || durationMinutes > 720) {
        return { error: 'Duration must be between 15 and 720 minutes.' };
      }
      if (frequency === 'weekly' && !weekDays.length) {
        return { error: 'Select at least one weekday for weekly sessions.' };
      }

      return {
        payload: {
          title,
          price,
          scheduleStartDate,
          scheduleStartTime,
          durationMinutes: Math.round(durationMinutes),
          frequency,
          weekDays,
        },
      };
    }

    if (classSessionFrequency) {
      classSessionFrequency.addEventListener('change', () => {
        toggleWeekDaysGroup(classSessionWeekDaysGroup, classSessionFrequency.value);
      });
      toggleWeekDaysGroup(classSessionWeekDaysGroup, classSessionFrequency.value);
    }

    if (classSessionEditFrequency) {
      classSessionEditFrequency.addEventListener('change', () => {
        toggleWeekDaysGroup(classSessionEditWeekDaysGroup, classSessionEditFrequency.value);
      });
      toggleWeekDaysGroup(classSessionEditWeekDaysGroup, classSessionEditFrequency.value);
    }

    if (classSessionStartDate && !classSessionStartDate.value) {
      classSessionStartDate.value = toDateInputValue(new Date());
    }
    if (classSessionStartTime && !classSessionStartTime.value) {
      classSessionStartTime.value = '18:00';
    }
    if (classSessionDurationMinutes && !classSessionDurationMinutes.value) {
      classSessionDurationMinutes.value = '60';
    }
    if (classSessionPrice && !classSessionPrice.value) {
      classSessionPrice.value = '0.00';
    }

    if (classSessionForm) {
      classSessionForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearFeedback(classSessionModalFeedback);
        clearFeedback(classFeedback);
        const parsed = collectClassSessionPayload({ mode: 'create' });
        if (parsed.error) {
          showFeedback(classSessionModalFeedback, parsed.error, 'error');
          return;
        }

        try {
          await request('/api/admin/class-sessions', {
            method: 'POST',
            body: JSON.stringify(parsed.payload),
          });

          classSessionForm.reset();
          if (classSessionFrequency) {
            classSessionFrequency.value = 'weekly';
            toggleWeekDaysGroup(classSessionWeekDaysGroup, classSessionFrequency.value);
          }
          setWeekDayInputs(classSessionWeekDayInputs, [1]);
          if (classSessionStartDate) {
            classSessionStartDate.value = toDateInputValue(new Date());
          }
          if (classSessionStartTime) {
            classSessionStartTime.value = '18:00';
          }
          if (classSessionDurationMinutes) {
            classSessionDurationMinutes.value = '60';
          }
          if (classSessionPrice) {
            classSessionPrice.value = '0.00';
          }
          hideModal(classSessionModal, classSessionModalElement);
          await loadLiveClassStatus();
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
        const parsed = collectClassSessionPayload({ mode: 'edit' });
        if (!sessionId) {
          showFeedback(classSessionEditModalFeedback, 'Session id is required.', 'error');
          return;
        }
        if (parsed.error) {
          showFeedback(classSessionEditModalFeedback, parsed.error, 'error');
          return;
        }

        try {
          await request(`/api/admin/class-sessions/${sessionId}`, {
            method: 'PUT',
            body: JSON.stringify(parsed.payload),
          });

          classSessionEditForm.reset();
          hideModal(classSessionEditModal, classSessionEditModalElement);
          await loadLiveClassStatus();
          await loadClassSessions();
          showFeedback(classFeedback, 'Session updated successfully.', 'success');
        } catch (error) {
          showFeedback(classSessionEditModalFeedback, error.message, 'error');
        }
      });
    }

    if (liveStreamScheduleForm) {
      liveStreamScheduleForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearFeedback(liveStreamScheduleModalFeedback);
        clearFeedback(classFeedback);

        const startsAt = (liveStreamStartsAt && liveStreamStartsAt.value ? liveStreamStartsAt.value : '').trim();
        const note = (liveStreamNote && liveStreamNote.value ? liveStreamNote.value : '').trim();

        if (!startsAt) {
          showFeedback(liveStreamScheduleModalFeedback, 'Start date/time is required.', 'error');
          return;
        }

        try {
          await request('/api/admin/live-stream-schedule', {
            method: 'PUT',
            body: JSON.stringify({ startsAt, note }),
          });

          hideModal(liveStreamScheduleModal, liveStreamScheduleModalElement);
          await loadLiveStreamSchedule();
          showFeedback(classFeedback, 'Live stream countdown updated successfully.', 'success');
        } catch (error) {
          showFeedback(liveStreamScheduleModalFeedback, error.message, 'error');
        }
      });
    }

    if (questionAnswerForm) {
      questionAnswerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearFeedback(questionAnswerModalFeedback);
        clearFeedback(questionFeedback);

        const questionId = (questionAnswerId.value || '').trim();
        const answer = (questionAnswerInput.value || '').trim();

        if (!questionId || !answer) {
          showFeedback(questionAnswerModalFeedback, 'Answer is required.', 'error');
          return;
        }

        try {
          await request(`/api/admin/questions/${questionId}/answer`, {
            method: 'PUT',
            body: JSON.stringify({ answer }),
          });

          questionAnswerForm.reset();
          hideModal(questionAnswerModal, questionAnswerModalElement);
          await loadQuestions();
          showFeedback(questionFeedback, 'Answer updated successfully.', 'success');
        } catch (error) {
          showFeedback(questionAnswerModalFeedback, error.message, 'error');
        }
      });
    }

    if (questionAnswerSelect) {
      questionAnswerSelect.addEventListener('change', (event) => {
        const selectedId = event.target.value;
        syncQuestionAnswerFormById(selectedId);
      });
    }

    if (answerQuestionsBtn) {
      answerQuestionsBtn.addEventListener('click', () => {
        const unansweredQuestions = state.questions.filter((item) => !item.isAnswered);
        if (!unansweredQuestions.length) {
          showFeedback(questionFeedback, 'No questions available to answer.', 'error');
          return;
        }

        openQuestionAnswerEditor({
          includeOnlyUnanswered: true,
          selectedId: unansweredQuestions[0]._id,
        });
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
        await refreshAll();
        showFeedback(adminFeedback, 'Admin deleted successfully.', 'success');
      } catch (error) {
        showFeedback(adminFeedback, error.message, 'error');
      }
    });

    questionList.addEventListener('click', async (event) => {
      const editButton = event.target.closest('[data-action="edit-answer"]');
      if (editButton) {
        const { id } = editButton.dataset;
        openQuestionAnswerEditor({
          includeOnlyUnanswered: false,
          selectedId: id,
        });
        return;
      }

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
        await refreshAll();
        showFeedback(questionFeedback, 'Question deleted successfully.', 'success');
      } catch (error) {
        showFeedback(questionFeedback, error.message, 'error');
      }
    });

    articleList.addEventListener('click', async (event) => {
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
        await refreshAll();
        showFeedback(articleFeedback, 'Article deleted successfully.', 'success');
      } catch (error) {
        showFeedback(articleFeedback, error.message, 'error');
      }
    });

    classList.addEventListener('click', async (event) => {
      const startButton = event.target.closest('[data-action="start-class-session"]');
      if (startButton) {
        const { id } = startButton.dataset;
        if (!id || !(await confirmDelete('Start live class with this session? This will set the current active session.', {
          confirmTitle: 'Confirm Start',
          confirmText: 'Start',
          confirmVariant: 'success',
        }))) {
          return;
        }

        try {
          await request('/api/admin/live-class/start', {
            method: 'POST',
            body: JSON.stringify({ sessionId: id }),
          });
          await loadLiveClassStatus();
          await loadClassSessions();
          showFeedback(classFeedback, 'Live class started successfully.', 'success');
        } catch (error) {
          showFeedback(classFeedback, error.message, 'error');
        }
        return;
      }

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
                    <small class="text-muted">Phone: ${escapeHtml(user.phoneNumber || 'N/A')} | Payment: ${escapeHtml(user.paymentMethod || 'N/A')} - ${escapeHtml(user.paymentReference || 'N/A')}</small>
                    <small class="d-block text-muted">Registered: ${escapeHtml(formatDateTime(user.createdAt))}</small>
                  </div>
                  <span class="badge ${user.approved ? 'text-bg-success' : 'text-bg-secondary'}">
                    ${user.approved ? `Approved (expires ${escapeHtml(formatDateTime(user.accessExpiresAt))})` : 'Pending Approval'}
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
        if (classSessionEditPrice) {
          classSessionEditPrice.value = Number.isFinite(Number(session.price)) ? Number(session.price).toFixed(2) : '0.00';
        }
        if (classSessionEditStartDate) {
          classSessionEditStartDate.value = toDateInputValue(session.schedule && session.schedule.startDate ? session.schedule.startDate : '');
        }
        if (classSessionEditStartTime) {
          classSessionEditStartTime.value = session.schedule && session.schedule.startTime
            ? session.schedule.startTime
            : '18:00';
        }
        if (classSessionEditDurationMinutes) {
          classSessionEditDurationMinutes.value = session.schedule && session.schedule.durationMinutes
            ? session.schedule.durationMinutes
            : 60;
        }
        if (classSessionEditFrequency) {
          classSessionEditFrequency.value = session.schedule && session.schedule.frequency === 'daily'
            ? 'daily'
            : 'weekly';
          toggleWeekDaysGroup(classSessionEditWeekDaysGroup, classSessionEditFrequency.value);
        }
        setWeekDayInputs(
          classSessionEditWeekDayInputs,
          session.schedule && Array.isArray(session.schedule.weekDays) ? session.schedule.weekDays : []
        );
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
        await refreshAll();
        showFeedback(classFeedback, 'Class session deleted successfully.', 'success');
      } catch (error) {
        showFeedback(classFeedback, error.message, 'error');
      }
    });

    if (endLiveClassBtn) {
      endLiveClassBtn.addEventListener('click', async () => {
        clearFeedback(classFeedback);

        if (!(await confirmDelete('End the current live class?', {
          confirmTitle: 'Confirm End',
          confirmText: 'End',
          confirmVariant: 'warning',
        }))) {
          return;
        }

        try {
          await request('/api/admin/live-class/end', { method: 'POST' });
          await loadLiveClassStatus();
          await loadClassSessions();
          showFeedback(classFeedback, 'Live class ended successfully.', 'success');
        } catch (error) {
          showFeedback(classFeedback, error.message, 'error');
        }
      });
    }

    if (clearLiveStreamScheduleBtn) {
      clearLiveStreamScheduleBtn.addEventListener('click', async () => {
        clearFeedback(classFeedback);
        if (!(await confirmDelete('Clear incoming live video countdown from home page?', {
          confirmTitle: 'Clear Countdown',
          confirmText: 'Clear',
          confirmVariant: 'secondary',
        }))) {
          return;
        }

        try {
          await request('/api/admin/live-stream-schedule', { method: 'DELETE' });
          await loadLiveStreamSchedule();
          showFeedback(classFeedback, 'Live stream countdown cleared.', 'success');
        } catch (error) {
          showFeedback(classFeedback, error.message, 'error');
        }
      });
    }

    if (joinLiveClassBtn) {
      joinLiveClassBtn.addEventListener('click', () => {
        if (joinLiveClassBtn.hasAttribute('disabled')) {
          return;
        }
        window.location.href = '/live_class/admin';
      });
    }

    categoryList.addEventListener('click', async (event) => {
      const editButton = event.target.closest('[data-action="edit-category"]');
      if (editButton) {
        const { id } = editButton.dataset;
        const category = state.categories.find((item) => String(item._id) === String(id));

        if (!category || !categoryEditForm || !categoryEditId || !categoryEditTitle) {
          showFeedback(categoryFeedback, 'Unable to load category editor.', 'error');
          return;
        }

        clearFeedback(categoryEditModalFeedback);
        categoryEditId.value = category._id;
        categoryEditTitle.value = category.title || '';
        showModal(categoryEditModal, categoryEditModalElement);
        return;
      }

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
        await refreshAll();
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
        await refreshAll();
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
