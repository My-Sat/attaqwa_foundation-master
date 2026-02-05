// script.js (Place this code inside a script tag in your Pug file or external JS file)
document.addEventListener('DOMContentLoaded', function () {
    const phoneInput = document.getElementById('phoneNumber');
  
    // Listen for input changes
    phoneInput.addEventListener('blur', function () {
      let phone = phoneInput.value.trim();
  
      // If the phone number starts with '0' (local format), replace it with +233
      if (phone.startsWith('0')) {
        phone = '+233' + phone.substring(1);
        phoneInput.value = phone;
      } else if (!phone.startsWith('+233') && phone.length > 0) {
        phoneInput.value = '+233' + phone; 
      }
    });
  });
  