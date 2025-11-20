// src/lib/opusApi.js

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://opus-backend-production.up.railway.app';

// Helper to handle responses
async function handleResponse(res) {
  const text = await res.text();

  if (!res.ok) {
    // Try to parse JSON if possible, otherwise return plain text
    try {
      const data = JSON.parse(text);
      const message = data.message || data.error || text || 'Request failed';
      throw new Error(message);
    } catch {
      throw new Error(text || 'Request failed');
    }
  }

  // If there was no body, return null
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// ───────────────── SIGNUP ─────────────────

export async function signupDirector(payload) {
  const res = await fetch(`${API_BASE_URL}/directors/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(res);
}

// ─────────────── CREATE ENSEMBLE ───────────────

export async function createEnsemble(payload) {
  const res = await fetch(`${API_BASE_URL}/ensembles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(res);
}

// ─────────────── GET ENSEMBLES ───────────────
// Optional directorId override, but still works exactly the same
// if you call getEnsembles() with no arguments.
export async function getEnsembles(directorId) {
  const id = directorId ?? localStorage.getItem('directorId');

  if (!id) {
    // This error will be shown in the red box on the dashboard
    throw new Error('Please sign in or create an account first.');
  }

  const res = await fetch(
    `${API_BASE_URL}/ensembles?director_id=${encodeURIComponent(id)}`
  );

  return handleResponse(res);
}

// ─────────────── ROSTER (NEW) ───────────────

// Get roster for a specific ensemble
export async function getRoster(ensembleId) {
  if (!ensembleId) {
    throw new Error('ensembleId is required to load roster.');
  }

  const res = await fetch(
    `${API_BASE_URL}/roster?ensemble_id=${encodeURIComponent(ensembleId)}`
  );

  return handleResponse(res);
}

// Add a single roster member
export async function addRosterMember(payload) {
  // expects: { ensemble_id, first_name, last_name, email?, phone?, status?, external_id? }
  const res = await fetch(`${API_BASE_URL}/roster`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(res);
}
