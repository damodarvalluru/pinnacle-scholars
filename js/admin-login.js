// Admin login: credentials are only ever sent to the backend over HTTPS.
// Nothing about the admin password or PIN is stored in browser code or storage.
(function () {
    'use strict';

    var API_BASE = window.PINNACLE_API_BASE || 'https://pinnacle-backend-5i7n.onrender.com';
    var form = document.getElementById('adminLoginForm');
    if (!form) return;

    var passwordInput = document.getElementById('adminPassword');
    var pinInput = document.getElementById('adminPin');
    var errorBox = document.getElementById('adminLoginError');
    var submitButton = document.getElementById('adminLoginSubmit');

    function showError(message) {
        errorBox.textContent = message;
        errorBox.hidden = false;
    }

    function clearError() {
        errorBox.textContent = '';
        errorBox.hidden = true;
    }

    document.querySelectorAll('.admin-field__reveal').forEach(function (button) {
        button.addEventListener('click', function () {
            var input = document.getElementById(button.getAttribute('data-reveal'));
            if (!input) return;
            var revealing = input.type === 'password';
            input.type = revealing ? 'text' : 'password';
            button.textContent = revealing ? 'Hide' : 'Show';
            button.setAttribute('aria-label', revealing ? 'Hide credential' : 'Show credential');
        });
    });

    [passwordInput, pinInput].forEach(function (input) {
        input.addEventListener('input', clearError);
    });

    // An already authenticated admin should not see the login form again.
    fetch(API_BASE + '/api/admin/session', {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
    }).then(function (response) {
        if (response.ok) window.location.replace('admin-dashboard.html');
    }).catch(function () { /* offline / backend waking up — stay on the form */ });

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        clearError();

        var password = passwordInput.value;
        var pin = pinInput.value.trim();
        if (!password || !pin) {
            showError('Enter both the admin password and the security PIN.');
            return;
        }

        submitButton.disabled = true;
        submitButton.querySelector('.admin-auth-submit__label').textContent = 'Verifying…';

        fetch(API_BASE + '/api/admin/login', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ password: password, pin: pin })
        }).then(function (response) {
            return response.json().catch(function () { return {}; }).then(function (data) {
                return { status: response.status, data: data };
            });
        }).then(function (result) {
            if (result.status === 200 && result.data.success) {
                window.location.assign('admin-dashboard.html');
                return;
            }
            var message = result.data.message || 'Unable to sign in. Please try again.';
            if (result.status === 423 && result.data.retryAfterSeconds) {
                var minutes = Math.ceil(result.data.retryAfterSeconds / 60);
                message += ' Try again in about ' + minutes + ' minute' + (minutes === 1 ? '' : 's') + '.';
            }
            showError(message);
            pinInput.value = '';
            submitButton.disabled = false;
            submitButton.querySelector('.admin-auth-submit__label').textContent = 'Verify & Continue';
        }).catch(function () {
            showError('The authentication service is unreachable. Please retry shortly.');
            submitButton.disabled = false;
            submitButton.querySelector('.admin-auth-submit__label').textContent = 'Verify & Continue';
        });
    });
})();
