(function () {
  function initAdminCreateArticle() {
    const form = document.getElementById('adminCreateArticleForm');
    const titleInput = document.getElementById('articleTitle');
    const contentField = document.getElementById('content');
    const previewTitle = document.getElementById('articlePreviewTitle');
    const previewContent = document.getElementById('articlePreviewContent');
    const contentError = document.getElementById('articleContentError');

    if (!form || !titleInput || !contentField || !previewTitle || !previewContent) {
      return;
    }

    let editorInstance = null;

    function stripHtml(value) {
      const element = document.createElement('div');
      element.innerHTML = value || '';
      return (element.textContent || element.innerText || '').trim();
    }

    function setContentError(message) {
      if (!contentError) {
        return;
      }

      if (!message) {
        contentError.classList.add('d-none');
        contentError.textContent = '';
        return;
      }

      contentError.classList.remove('d-none');
      contentError.classList.add('text-danger');
      contentError.textContent = message;
    }

    function updatePreview() {
      const title = titleInput.value.trim();
      const rawContent = editorInstance ? editorInstance.getData() : contentField.value;
      const plainContent = stripHtml(rawContent);

      previewTitle.textContent = title || 'Untitled article';
      if (!plainContent) {
        previewContent.innerHTML = '<p class="text-muted">Content preview will appear here.</p>';
        return;
      }

      previewContent.innerHTML = rawContent;
    }

    titleInput.addEventListener('input', updatePreview);

    form.addEventListener('submit', (event) => {
      const submitter = event.submitter;
      const intent = submitter && submitter.value ? String(submitter.value).toLowerCase() : 'published';
      const shouldPublish = intent === 'published';
      const contentValue = editorInstance ? editorInstance.getData() : contentField.value;
      const plainContent = stripHtml(contentValue);
      contentField.value = contentValue;

      if (shouldPublish && !plainContent) {
        event.preventDefault();
        setContentError('Content is required before publishing.');
        return;
      }

      setContentError('');
    });

    if (window.ClassicEditor) {
      window.ClassicEditor
        .create(contentField)
        .then((editor) => {
          editorInstance = editor;
          editor.model.document.on('change:data', updatePreview);
          updatePreview();
        })
        .catch(() => {
          contentField.addEventListener('input', updatePreview);
          updatePreview();
        });
      return;
    }

    contentField.addEventListener('input', updatePreview);
    updatePreview();
  }

  if (document.readyState === 'complete') {
    initAdminCreateArticle();
  } else {
    window.addEventListener('load', initAdminCreateArticle, { once: true });
  }
})();
