(function () {
  function initPasswordSettings() {
    const form = document.getElementById('passwordSettingsForm');
    if (!form) {
      return;
    }

    const newPasswordInput = document.getElementById('newPassword');
    const confirmInput = document.getElementById('confirmNewPassword');
    const matchIndicator = document.getElementById('passwordSettingsMatch');
    const toggleButtons = document.querySelectorAll('.password-toggle-btn');

    const updateMatch = () => {
      if (!newPasswordInput || !confirmInput || !matchIndicator) {
        return;
      }

      const newValue = newPasswordInput.value || '';
      const confirmValue = confirmInput.value || '';

      matchIndicator.classList.remove('text-danger', 'text-success', 'text-muted');
      if (!newValue && !confirmValue) {
        matchIndicator.classList.add('text-muted');
        matchIndicator.textContent = 'Type to confirm password.';
        return;
      }

      if (!confirmValue) {
        matchIndicator.classList.add('text-muted');
        matchIndicator.textContent = 'Confirm your new password.';
        return;
      }

      if (newValue === confirmValue) {
        matchIndicator.classList.add('text-success');
        matchIndicator.textContent = 'Passwords match.';
        return;
      }

      matchIndicator.classList.add('text-danger');
      matchIndicator.textContent = 'Passwords do not match.';
    };

    toggleButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const inputId = button.getAttribute('data-toggle-target');
        const input = inputId ? document.getElementById(inputId) : null;
        if (!input) {
          return;
        }

        const isPasswordType = input.type === 'password';
        input.type = isPasswordType ? 'text' : 'password';
        const icon = button.querySelector('i');
        if (icon) {
          icon.classList.toggle('fa-eye', !isPasswordType);
          icon.classList.toggle('fa-eye-slash', isPasswordType);
        }
      });
    });

    if (newPasswordInput) {
      newPasswordInput.addEventListener('input', updateMatch);
    }
    if (confirmInput) {
      confirmInput.addEventListener('input', updateMatch);
    }
    updateMatch();
  }

  if (document.readyState === 'complete') {
    initPasswordSettings();
  } else {
    window.addEventListener('load', initPasswordSettings, { once: true });
  }
})();
