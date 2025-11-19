// src/lib/opusApi.js

const API_BASE_URL = import.meta.env.VITE_API_URL;

// CREATE ENSEMBLE
export async function createEnsemble(data) {
  const res = await fetch(`${API_BASE_URL}/ensembles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create ensemble');
  }

  return res.json();
}

// GET ENSEMBLES (optionally by directorId)
export async function getEnsembles(directorId) {
  const url = directorId
    ? `${API_BASE_URL}/ensembles?directorId=${encodeURIComponent(directorId)}`
    : `${API_BASE_URL}/ensembles`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error('Failed to fetch ensembles');
  }

  return res.json();
}

// SIGN UP DIRECTOR
export async function signupDirector(data) {
  const res = await fetch(`${API_BASE_URL}/auth/signup-director`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to sign up');
  }

  return res.json();
}
