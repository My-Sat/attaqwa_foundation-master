(function () {
  function initAdminCreateArticle() {
    const form = document.getElementById('adminCreateArticleForm');
    const pageTitle = document.getElementById('articlePageTitle');
    const pageSubtitle = document.getElementById('articlePageSubtitle');
    const languageLabel = document.getElementById('articleLanguageLabel');
    const languageHelp = document.getElementById('articleLanguageHelp');
    const titleInput = document.getElementById('articleTitle');
    const titleLabel = document.getElementById('articleTitleLabel');
    const titleHelp = document.getElementById('articleTitleHelp');
    const languageSelect = document.getElementById('articleLanguage');
    const contentLabel = document.getElementById('articleContentLabel');
    const contentField = document.getElementById('content');
    const saveDraftBtn = document.getElementById('articleSaveDraftBtn');
    const publishBtn = document.getElementById('articlePublishBtn');
    const backBtn = document.getElementById('articleBackBtn');
    const previewPanelTitle = document.getElementById('articlePreviewPanelTitle');
    const previewPanelSubtitle = document.getElementById('articlePreviewPanelSubtitle');
    const previewTitle = document.getElementById('articlePreviewTitle');
    const previewContent = document.getElementById('articlePreviewContent');
    const contentError = document.getElementById('articleContentError');

    if (!form || !titleInput || !contentField || !previewTitle || !previewContent || !languageSelect) {
      return;
    }

    let editorInstance = null;
    const pageMode = pageTitle && pageTitle.dataset.mode === 'edit' ? 'edit' : 'create';

    const textByLanguage = {
      en: {
        pageTitle: pageMode === 'edit' ? 'Edit Article' : 'Create Article',
        pageSubtitle: pageMode === 'edit'
          ? 'Continue editing this article, save as draft, or publish when final.'
          : 'Write and publish an article with rich formatting from one focused workspace.',
        languageLabel: 'Language',
        languageHelp: 'English is default. Switch to Arabic for right-to-left writing.',
        languageOptionEnglish: 'English',
        languageOptionArabic: 'Arabic',
        titleLabel: 'Title',
        titlePlaceholder: 'e.g. Building disciplined worship habits',
        titleHelp: 'Keep it concise and clear (max 140 characters).',
        contentLabel: 'Content',
        saveDraft: 'Save Draft',
        publish: 'Publish Article',
        back: 'Back to Dashboard',
        previewPanelTitle: 'Live Preview',
        previewPanelSubtitle: 'Review formatting before publishing.',
        previewUntitled: 'Untitled article',
        previewEmpty: 'Content preview will appear here.',
        publishContentRequired: 'Content is required before publishing.',
      },
      ar: {
        pageTitle: pageMode === 'edit' ? 'تعديل المقال' : 'إنشاء مقال',
        pageSubtitle: pageMode === 'edit'
          ? 'واصل تعديل هذا المقال، واحفظه كمسودة أو انشره عند الانتهاء.'
          : 'اكتب وانشر مقالًا بتنسيق غني من مساحة عمل واحدة.',
        languageLabel: 'اللغة',
        languageHelp: 'الإنجليزية هي الافتراضية. اختر العربية للكتابة من اليمين إلى اليسار.',
        languageOptionEnglish: 'الإنجليزية',
        languageOptionArabic: 'العربية',
        titleLabel: 'العنوان',
        titlePlaceholder: 'مثال: بناء عادات عبادة منضبطة',
        titleHelp: 'اجعل العنوان واضحًا ومختصرًا (بحد أقصى 140 حرفًا).',
        contentLabel: 'المحتوى',
        saveDraft: 'حفظ كمسودة',
        publish: 'نشر المقال',
        back: 'العودة إلى لوحة التحكم',
        previewPanelTitle: 'معاينة مباشرة',
        previewPanelSubtitle: 'راجع التنسيق قبل النشر.',
        previewUntitled: 'مقال بدون عنوان',
        previewEmpty: 'ستظهر معاينة المحتوى هنا.',
        publishContentRequired: 'المحتوى مطلوب قبل النشر.',
      },
    };

    function stripHtml(value) {
      const element = document.createElement('div');
      element.innerHTML = value || '';
      return (element.textContent || element.innerText || '').trim();
    }

    function getCopy() {
      return textByLanguage[getLanguageMode()];
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

    function getLanguageMode() {
      return languageSelect.value === 'ar' ? 'ar' : 'en';
    }

    function applyUiText() {
      const copy = getCopy();
      const englishOption = languageSelect.querySelector('option[value="en"]');
      const arabicOption = languageSelect.querySelector('option[value="ar"]');

      if (pageTitle) {
        pageTitle.textContent = copy.pageTitle;
      }
      if (pageSubtitle) {
        pageSubtitle.textContent = copy.pageSubtitle;
      }
      if (languageLabel) {
        languageLabel.textContent = copy.languageLabel;
      }
      if (languageHelp) {
        languageHelp.textContent = copy.languageHelp;
      }
      if (englishOption) {
        englishOption.textContent = copy.languageOptionEnglish;
      }
      if (arabicOption) {
        arabicOption.textContent = copy.languageOptionArabic;
      }
      if (titleLabel) {
        titleLabel.textContent = copy.titleLabel;
      }
      titleInput.placeholder = copy.titlePlaceholder;
      if (titleHelp) {
        titleHelp.textContent = copy.titleHelp;
      }
      if (contentLabel) {
        contentLabel.textContent = copy.contentLabel;
      }
      if (saveDraftBtn) {
        saveDraftBtn.textContent = copy.saveDraft;
      }
      if (publishBtn) {
        publishBtn.textContent = copy.publish;
      }
      if (backBtn) {
        backBtn.textContent = copy.back;
      }
      if (previewPanelTitle) {
        previewPanelTitle.textContent = copy.previewPanelTitle;
      }
      if (previewPanelSubtitle) {
        previewPanelSubtitle.textContent = copy.previewPanelSubtitle;
      }
    }

    function applyLanguageMode() {
      const language = getLanguageMode();
      const direction = language === 'ar' ? 'rtl' : 'ltr';
      const alignment = language === 'ar' ? 'right' : 'left';

      titleInput.setAttribute('dir', direction);
      titleInput.style.textAlign = alignment;
      contentField.setAttribute('dir', direction);
      previewTitle.setAttribute('dir', direction);
      previewContent.setAttribute('dir', direction);
      previewTitle.style.textAlign = alignment;
      previewContent.style.textAlign = alignment;

      const editable = form.querySelector('.ck-editor__editable');
      if (editable) {
        editable.setAttribute('dir', direction);
        editable.style.textAlign = alignment;
      }
    }

    function updatePreview() {
      const copy = getCopy();
      const title = titleInput.value.trim();
      const rawContent = editorInstance ? editorInstance.getData() : contentField.value;
      const plainContent = stripHtml(rawContent);

      previewTitle.textContent = title || copy.previewUntitled;
      if (!plainContent) {
        previewContent.innerHTML = `<p class="text-muted">${copy.previewEmpty}</p>`;
        applyLanguageMode();
        return;
      }

      previewContent.innerHTML = rawContent;
      applyLanguageMode();
    }

    titleInput.addEventListener('input', updatePreview);
    languageSelect.addEventListener('change', () => {
      applyUiText();
      updatePreview();
    });

    form.addEventListener('submit', (event) => {
      const submitter = event.submitter;
      const intent = submitter && submitter.value ? String(submitter.value).toLowerCase() : 'published';
      const shouldPublish = intent === 'published';
      const contentValue = editorInstance ? editorInstance.getData() : contentField.value;
      const plainContent = stripHtml(contentValue);
      contentField.value = contentValue;

      if (shouldPublish && !plainContent) {
        event.preventDefault();
        setContentError(getCopy().publishContentRequired);
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
          applyUiText();
          applyLanguageMode();
          updatePreview();
        })
        .catch(() => {
          contentField.addEventListener('input', updatePreview);
          applyUiText();
          applyLanguageMode();
          updatePreview();
        });
      return;
    }

    contentField.addEventListener('input', updatePreview);
    applyUiText();
    applyLanguageMode();
    updatePreview();
  }

  if (document.readyState === 'complete') {
    initAdminCreateArticle();
  } else {
    window.addEventListener('load', initAdminCreateArticle, { once: true });
  }
})();
