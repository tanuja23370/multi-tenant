// API Base URL
const API_URL = '/api/auth';

/**
 * Show message to user
 */
function showMessage(elementId, message, type = 'error') {
  const messageEl = document.getElementById(elementId);
  if (messageEl) {
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';
  }
}

/**
 * Clear message
 */
function clearMessage(elementId) {
  const messageEl = document.getElementById(elementId);
  if (messageEl) {
    messageEl.textContent = '';
    messageEl.style.display = 'none';
  }
}

/**
 * Handle user registration
 */
async function handleRegister(e) {
  e.preventDefault();
  clearMessage('message');

  const email = document.getElementById('email').value.trim();
  const mobile = document.getElementById('mobile').value.trim();
  const password = document.getElementById('password').value;

  // Basic validation
  if (!email || !mobile || !password) {
    showMessage('message', 'All fields are required', 'error');
    return;
  }

  // Validate mobile number (10 digits only)
  if (!/^\d{10}$/.test(mobile)) {
    showMessage('message', 'Mobile number must be exactly 10 digits', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, mobile, password })
    });

    const data = await response.json();

    if (response.ok) {
      showMessage('message', 'Registration successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1500);
    } else {
      showMessage('message', data.message || 'Registration failed', 'error');
    }
  } catch (error) {
    console.error('Registration error:', error);
    showMessage('message', 'Network error. Please try again.', 'error');
  }
}

/**
 * Handle user login
 */
async function handleLogin(e) {
  e.preventDefault();
  clearMessage('message');

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  // Basic validation
  if (!email || !password) {
    showMessage('message', 'Email and password are required', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      showMessage('message', 'Login successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1500);
    } else {
      showMessage('message', data.message || 'Login failed', 'error');
    }
  } catch (error) {
    console.error('Login error:', error);
    showMessage('message', 'Network error. Please try again.', 'error');
  }
}

/**
 * Load user information on dashboard
 */
async function loadUserInfo() {
  clearMessage('message');

  try {
    const response = await fetch(`${API_URL}/user`, {
      method: 'GET',
      credentials: 'include'
    });

    const data = await response.json();

    if (response.ok) {
      displayUserInfo(data);
    } else {
      showMessage('message', 'Session expired. Please login again.', 'error');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    }
  } catch (error) {
    console.error('Load user error:', error);
    showMessage('message', 'Failed to load user information', 'error');
  }
}

/**
 * Display user information
 */
function displayUserInfo(user) {
  const userInfoEl = document.getElementById('userInfo');
  
  if (userInfoEl) {
    userInfoEl.innerHTML = `
      <div class="info-card">
        <div class="info-item">
          <span class="info-label">Email</span>
          <span class="info-value">${user.email}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Mobile</span>
          <span class="info-value">${user.mobile}</span>
        </div>
        <div class="info-item">
          <span class="info-label">User ID</span>
          <span class="info-value">${user.userId}</span>
        </div>
      </div>
    `;
  }
}

/**
 * Handle user logout
 */
async function handleLogout() {
  try {
    const response = await fetch(`${API_URL}/logout`, {
      method: 'POST',
      credentials: 'include'
    });

    const data = await response.json();

    if (response.ok) {
      showMessage('message', 'Logout successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
    } else {
      showMessage('message', data.message || 'Logout failed', 'error');
    }
  } catch (error) {
    console.error('Logout error:', error);
    showMessage('message', 'Network error during logout', 'error');
  }
}
