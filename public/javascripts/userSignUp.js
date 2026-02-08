(function () {
  function initUserSignUp() {
    const form = document.getElementById('userSignUpForm');
    if (!form) {
      return;
    }

    const phoneInput = document.getElementById('phoneNumber');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const matchIndicator = document.getElementById('userPasswordMatch');
    const toggles = form.querySelectorAll('.password-toggle-btn');

    function updatePasswordMatch() {
      if (!password || !confirmPassword || !matchIndicator) {
        return;
      }

      const passwordValue = password.value || '';
      const confirmValue = confirmPassword.value || '';

      matchIndicator.classList.remove('text-muted', 'text-success', 'text-danger');

      if (!passwordValue && !confirmValue) {
        matchIndicator.classList.add('text-muted');
        matchIndicator.textContent = 'Type to confirm password.';
        return;
      }

      if (!confirmValue) {
        matchIndicator.classList.add('text-muted');
        matchIndicator.textContent = 'Confirm password to check match.';
        return;
      }

      if (passwordValue === confirmValue) {
        matchIndicator.classList.add('text-success');
        matchIndicator.textContent = 'Passwords match.';
      } else {
        matchIndicator.classList.add('text-danger');
        matchIndicator.textContent = 'Passwords do not match.';
      }
    }

    toggles.forEach((toggle) => {
      toggle.addEventListener('click', () => {
        const targetId = toggle.getAttribute('data-toggle-target');
        const input = targetId ? document.getElementById(targetId) : null;
        const icon = toggle.querySelector('i');

        if (!input) {
          return;
        }

        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';

        if (icon) {
          icon.classList.toggle('fa-eye', !isPassword);
          icon.classList.toggle('fa-eye-slash', isPassword);
        }

        toggle.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
      });
    });

    if (phoneInput) {
      phoneInput.addEventListener('blur', () => {
        let phone = (phoneInput.value || '').trim();

        if (!phone) {
          return;
        }

        if (phone.startsWith('0')) {
          phone = `+233${phone.substring(1)}`;
        } else if (!phone.startsWith('+233')) {
          phone = `+233${phone}`;
        }

        phoneInput.value = phone;
      });
    }

    if (password) {
      password.addEventListener('input', updatePasswordMatch);
    }

    if (confirmPassword) {
      confirmPassword.addEventListener('input', updatePasswordMatch);
    }

    updatePasswordMatch();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUserSignUp);
  } else {
    initUserSignUp();
  }
})();
