/**
 * API service layer for the PersonaLearn React frontend.
 * In dev: Vite proxy forwards /api → http://localhost:8000
 * In prod: set VITE_API_URL to your backend base URL.
 */

const BASE_URL = import.meta.env.VITE_API_URL || '';

// ─── Token helpers ────────────────────────────────────────────────────────────
export function getAccessToken() {
  return localStorage.getItem('pl_access');
}

export function getRefreshToken() {
  return localStorage.getItem('pl_refresh');
}

export function setTokens(access, refresh) {
  localStorage.setItem('pl_access', access);
  if (refresh) localStorage.setItem('pl_refresh', refresh);
}

export function clearTokens() {
  localStorage.removeItem('pl_access');
  localStorage.removeItem('pl_refresh');
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = { ...options.headers };
  
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getAccessToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let response = await fetch(url, { ...options, headers });

  // Try token refresh if 401
  if (response.status === 401) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${getAccessToken()}`;
      response = await fetch(url, { ...options, headers });
    } else {
      clearTokens();
      window.dispatchEvent(new Event('auth:logout'));
      throw new Error('Session expired. Please log in again.');
    }
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw { status: response.status, data: errData };
  }

  if (response.status === 204) return null;
  return response.json();
}

async function tryRefreshToken() {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  try {
    const res = await fetch(`${BASE_URL}/api/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    setTokens(data.access, data.refresh);
    return true;
  } catch {
    return false;
  }
}

// ─── Auth APIs ────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data) =>
    apiFetch('/api/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (username, password) =>
    apiFetch('/api/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  logout: (refresh) =>
    apiFetch('/api/auth/logout/', {
      method: 'POST',
      body: JSON.stringify({ refresh }),
    }),

  me: () => apiFetch('/api/auth/me/'),

  updateProfile: (data) => {
    return apiFetch('/api/auth/me/', {
      method: 'PATCH',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  },

  changePassword: (data) =>
    apiFetch('/api/auth/change-password/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  upgradeRequest: (coupon) =>
    apiFetch('/api/auth/upgrade-request/', {
      method: 'POST',
      body: JSON.stringify({ coupon }),
    }),
};

// ─── Learning APIs ────────────────────────────────────────────────────────────
export const learningApi = {
  getSubjects: () => apiFetch('/api/subjects/'),

  getSubject: (slug) => apiFetch(`/api/subjects/${slug}/`),

  getTopics: (subjectSlug) =>
    apiFetch(`/api/subjects/${subjectSlug}/topics/`),

  getTopic: (subjectSlug, topicSlug) =>
    apiFetch(`/api/subjects/${subjectSlug}/topics/${topicSlug}/`),
};

// ─── Recommendation APIs ──────────────────────────────────────────────────────
export const recApi = {
  getPreferences: () => apiFetch('/api/preferences/'),

  getNextContent: (topicId) => apiFetch(`/api/next-content/${topicId}/`),

  submitInteraction: (contentVersionId, rating, skipped = false) =>
    apiFetch('/api/submit-interaction/', {
      method: 'POST',
      body: JSON.stringify({
        content_version_id: contentVersionId,
        rating,
        skipped,
      }),
    }),

  getRecommendedTopics: () => apiFetch('/api/recommended-topics/'),

  getRecommendedVideos: (topicId) =>
    apiFetch(`/api/recommended-videos/${topicId ? `?topic=${topicId}` : ''}`),

  getInteractionHistory: () => apiFetch('/api/interaction-history/'),
};

// ─── Chatbot APIs ─────────────────────────────────────────────────────────────
export const chatbotApi = {
  getStatus: () => apiFetch('/api/chatbot/status/'),

  sendMessage: (message, history = []) =>
    apiFetch('/api/chatbot/', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    }),
};

