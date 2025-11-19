// src/lib/opusApi.js

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  'https://opus-backend-production.up.railway.app';

// Small helper to handle errors consistently
async function handleJsonResponse(res, defaultMessage) {
  if (!res.ok) {
    let message = defaultMessage;
    try {
      const data = await res.json();
      if (data && data.error) message = data.error;
    } catch {
      // ignore JSON parse error, use defaultMessage
    }
    throw new Error(message);
  }
  return res.json();
}

// ---- DIRECTOR SIGNUP ----
export async function signupDirector(payload) {
  const res = await fetch(`${API_BASE}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return handleJsonResponse(res, 'Signup failed');
}

// ---- ENSEMBLES ----
export async function createEnsemble(payload) {
  const res = await fetch(`${API_BASE}/ensembles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return handleJsonResponse(res, 'Failed to create ensemble');
}

export async function fetchEnsembles() {
  const res = await fetch(`${API_BASE}/ensembles`);
  return handleJsonResponse(res, 'Failed to load ensembles');
}
