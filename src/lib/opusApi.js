// src/lib/opusApi.js
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://opus-backend-production.up.railway.app';

// ----- DIRECTOR SIGNUP -----
export async function signupDirector(payload) {
  const res = await fetch(`${API_BASE_URL}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  let data = {};
  try {
    data = await res.json();
  } catch (e) {
    // ignore
  }

  if (!res.ok) {
    throw new Error(data.error || 'Failed to sign up');
  }

  return data; // should contain { id, ... }
}

// ----- ENSEMBLES -----
export async function createEnsemble(payload) {
  const res = await fetch(`${API_BASE_URL}/ensembles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  let data = {};
  try {
    data = await res.json();
  } catch (e) {
    // ignore
  }

  if (!res.ok) {
    throw new Error(data.error || 'Failed to create ensemble');
  }

  return data;
}

export async function listEnsembles() {
  const res = await fetch(`${API_BASE_URL}/ensembles`);
  if (!res.ok) {
    throw new Error('Failed to fetch ensembles');
  }
  return res.json();
}
