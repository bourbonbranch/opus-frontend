// src/lib/opusApi.js

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://opus-backend-production.up.railway.app'; // your Railway URL

async function handleResponse(res) {
  if (!res.ok) {
    let message = 'Request failed';
    try {
      const data = await res.json();
      if (data && data.error) message = data.error;
    } catch {
      // response wasn't JSON, ignore
    }
    throw new Error(message);
  }
  return res.json();
}

// --- AUTH ---

export async function signupDirector(payload) {
  const res = await fetch(`${API_BASE_URL}/directors/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return handleResponse(res);
}

// --- ENSEMBLES ---

export async function createEnsemble(payload) {
  const res = await fetch(`${API_BASE_URL}/ensembles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return handleResponse(res);
}

export async function getEnsembles() {
  const res = await fetch(`${API_BASE_URL}/ensembles`);
  return handleResponse(res);
}
