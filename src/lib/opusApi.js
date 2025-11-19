// src/lib/opusApi.js

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://opus-backend-production.up.railway.app';

// Shared helper to handle responses
async function handleResponse(res) {
  const text = await res.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // ignore JSON parse errors, treat as plain text
  }

  if (!res.ok) {
    const message =
      (data && (data.error || data.message)) ||
      text ||
      `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data;
}

/**
 * Sign up a new director.
 * Expects backend POST /signup to return at least { id, ... }.
 */
export async function signupDirector({
  firstName,
  lastName,
  email,
  password,
  role = 'director',
}) {
  const res = await fetch(`${API_BASE_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      role,
    }),
  });

  return handleResponse(res);
}

/**
 * Create a new ensemble.
 * Expects backend POST /ensembles to return the created ensemble row.
 */
export async function createEnsemble({
  name,
  type,
  organization_name,
  level,
  size,
  director_id,
}) {
  const res = await fetch(`${API_BASE_URL}/ensembles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      type,
      organization_name,
      level,
      size,
      director_id,
    }),
  });

  return handleResponse(res);
}

/**
 * Fetch all ensembles (optionally for a specific director later).
 * Right now your backend GET /ensembles just returns all of them.
 */
export async function getEnsembles() {
  const res = await fetch(`${API_BASE_URL}/ensembles`, {
    method: 'GET',
  });

  return handleResponse(res);
}
