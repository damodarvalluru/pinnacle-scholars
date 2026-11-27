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
    var methodRadios = Array.prototype.slice.call(document.querySelectorAll('input[name="credentialMethod"]'));
    var credentialPanels = {
        password: document.getElementById('adminPasswordPanel'),
        pin: document.getElementById('adminPinPanel')
    };

    function selectedMethod() {
        var selected = methodRadios.filter(function (radio) { return radio.checked; })[0];
        return selected ? selected.value : 'password';
    }

    function syncCredentialMethod() {
        var method = selectedMethod();
        Object.keys(credentialPanels).forEach(function (key) {
            credentialPanels[key].hidden = key !== method;
        });
        methodRadios.forEach(function (radio) {
            radio.parentNode.classList.toggle('is-selected', radio.value === method);
        });
        clearError();
    }

    function showError(message) {
        errorBox.textContent = message;
        errorBox.hidden = false;
    }

    function clearError() {
        errorBox.textContent = '';
        errorBox.hidden = true;
    }

    // Visual state only: the loading-feedback bridge provides the single
    // spinner on the button itself. Keep the label in sync on failure.
    function setSubmitting(busy) {
        submitButton.disabled = busy;
        if (busy) submitButton.setAttribute('aria-busy', 'true');
        else submitButton.removeAttribute('aria-busy');
        submitButton.querySelector('.admin-auth-submit__label').textContent =
            busy ? 'Verifying…' : 'Verify & Continue';
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

    methodRadios.forEach(function (radio) {
        radio.addEventListener('change', syncCredentialMethod);
    });
    syncCredentialMethod();

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

        var method = selectedMethod();
        var body = {};
        if (method === 'password') {
            body.password = passwordInput.value;
            if (!body.password) {
                showError('Enter your admin password.');
                return;
            }
        } else {
            body.pin = pinInput.value.trim();
            if (!body.pin) {
                showError('Enter your 6-digit security PIN.');
                return;
            }
        }

        setSubmitting(true);

        fetch(API_BASE + '/api/admin/login', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(body)
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
            if (method === 'password') passwordInput.value = '';
            else pinInput.value = '';
            setSubmitting(false);
        }).catch(function () {
            showError('The authentication service is unreachable. Please retry shortly.');
            setSubmitting(false);
        });
    });
})();
