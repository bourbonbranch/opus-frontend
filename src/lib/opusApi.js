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

// ─────────────── ROOMS & ATTENDANCE ───────────────

export async function getRooms(directorId) {
  const id = directorId ?? localStorage.getItem('directorId');
  if (!id) throw new Error('Director ID required');

  const res = await fetch(`${API_BASE_URL}/rooms?director_id=${encodeURIComponent(id)}`);
  return handleResponse(res);
}

export async function createRoom(payload) {
  // expects: { name, director_id, beacon_uuid?, beacon_major?, beacon_minor? }
  const res = await fetch(`${API_BASE_URL}/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function logAttendance(payload) {
  // expects: { roster_id, room_id, status? }
  const res = await fetch(`${API_BASE_URL}/attendance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

// ─────────────── EVENTS ───────────────

export async function getEvents(ensembleId) {
  const res = await fetch(`${API_BASE_URL}/events?ensemble_id=${ensembleId}`);
  return handleResponse(res);
}

export async function createEvent(payload) {
  // expects: { ensemble_id, room_id?, name, type, start_time, end_time, description? }
  const res = await fetch(`${API_BASE_URL}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updateEvent(eventId, payload) {
  const res = await fetch(`${API_BASE_URL}/events/${eventId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteEvent(eventId) {
  const res = await fetch(`${API_BASE_URL}/events/${eventId}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}

