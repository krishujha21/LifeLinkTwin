const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const alertBox = document.getElementById('alertBox');

// Show alert message
function showAlert(message, type = 'error') {
    alertBox.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    setTimeout(() => {
        alertBox.innerHTML = '';
    }, 5000);
}

// Handle form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Disable button and show loading
    loginBtn.disabled = true;
    loginBtn.innerHTML = 'Logging in<span class="loading"></span>';

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            if (data.user?.role && data.user.role !== 'doctor') {
                showAlert('Access restricted: doctor-only dashboard.');
                loginBtn.disabled = false;
                loginBtn.innerHTML = 'Login';
                return;
            }
            showAlert('Login successful! Redirecting...', 'success');

            // Store token in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        } else {
            showAlert(data.message || 'Login failed');
            loginBtn.disabled = false;
            loginBtn.innerHTML = 'Login';
        }
    } catch (error) {
        console.error('Login error:', error);
        showAlert('Network error. Please check if the server is running.');
        loginBtn.disabled = false;
        loginBtn.innerHTML = 'Login';
    }
});

// Auto-fill credentials when clicking on demo links
document.querySelectorAll('.demo-credentials li').forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => {
        const username = 'doctor';
        document.getElementById('username').value = username;

        // Set password based on username
        const passwords = {
            'doctor': 'Doctor123!'
        };
        document.getElementById('password').value = passwords[username] || '';
    });
});
