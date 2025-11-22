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

// Update a roster member
export async function updateRosterMember(id, payload) {
  const res = await fetch(`${API_BASE_URL}/roster/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(res);
}

// Delete an ensemble
export async function deleteEnsemble(id) {
  const res = await fetch(`${API_BASE_URL}/ensembles/${id}`, {
    method: 'DELETE',
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

export async function updateRoom(id, payload) {
  const res = await fetch(`${API_BASE_URL}/rooms/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function getAttendance(roomId, date) {
  const params = new URLSearchParams();
  params.append('room_id', roomId);
  if (date) params.append('date', date);

  const res = await fetch(`${API_BASE_URL}/attendance?${params}`);
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

// ─────────────── CALENDAR ITEMS ───────────────

export async function getCalendarItems(directorId, ensembleId) {
  const params = new URLSearchParams();
  if (ensembleId) {
    params.append('ensemble_id', ensembleId);
  } else if (directorId) {
    params.append('director_id', directorId);
  }
  const res = await fetch(`${API_BASE_URL}/calendar-items?${params}`);
  return handleResponse(res);
}

export async function createCalendarItem(payload) {
  // expects: { director_id?, ensemble_id?, title, type, date, description?, color? }
  const res = await fetch(`${API_BASE_URL}/calendar-items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteCalendarItem(itemId) {
  const res = await fetch(`${API_BASE_URL}/calendar-items/${itemId}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}

// ─────────────── MESSAGES ───────────────

export async function getMessages(directorId) {
  const id = directorId ?? localStorage.getItem('directorId');
  if (!id) throw new Error('Director ID required');

  const res = await fetch(`${API_BASE_URL}/messages?director_id=${id}`);
  return handleResponse(res);
}

export async function sendMessage(payload) {
  // expects: { director_id, ensemble_id?, subject, content, recipients_summary, recipient_ids }
  const res = await fetch(`${API_BASE_URL}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

// ─────────────── TICKETS ───────────────

// Ticket Events
export async function getTicketEvents(directorId) {
  const id = directorId ?? localStorage.getItem('directorId');
  if (!id) throw new Error('Director ID required');

  const res = await fetch(`${API_BASE_URL}/ticket-events?director_id=${id}`);
  return handleResponse(res);
}

export async function getTicketEvent(eventId) {
  const res = await fetch(`${API_BASE_URL}/ticket-events/${eventId}`);
  return handleResponse(res);
}

export async function createTicketEvent(eventData) {
  const res = await fetch(`${API_BASE_URL}/ticket-events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventData),
  });
  return handleResponse(res);
}

export async function updateTicketEvent(eventId, eventData) {
  const res = await fetch(`${API_BASE_URL}/ticket-events/${eventId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventData),
  });
  return handleResponse(res);
}

export async function deleteTicketEvent(eventId) {
  const res = await fetch(`${API_BASE_URL}/ticket-events/${eventId}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}

// Performances
export async function getPerformances(eventId) {
  const res = await fetch(`${API_BASE_URL}/performances?event_id=${eventId}`);
  return handleResponse(res);
}

export async function createPerformance(performanceData) {
  const res = await fetch(`${API_BASE_URL}/performances`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(performanceData),
  });
  return handleResponse(res);
}

export async function updatePerformance(performanceId, performanceData) {
  const res = await fetch(`${API_BASE_URL}/performances/${performanceId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(performanceData),
  });
  return handleResponse(res);
}

export async function deletePerformance(performanceId) {
  const res = await fetch(`${API_BASE_URL}/performances/${performanceId}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}

// Ticket Types
export async function getTicketTypes(eventId) {
  const res = await fetch(`${API_BASE_URL}/ticket-types?event_id=${eventId}`);
  return handleResponse(res);
}

export async function createTicketType(ticketTypeData) {
  const res = await fetch(`${API_BASE_URL}/ticket-types`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ticketTypeData),
  });
  return handleResponse(res);
}

export async function updateTicketType(ticketTypeId, ticketTypeData) {
  const res = await fetch(`${API_BASE_URL}/ticket-types/${ticketTypeId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ticketTypeData),
  });
  return handleResponse(res);
}

export async function deleteTicketType(ticketTypeId) {
  const res = await fetch(`${API_BASE_URL}/ticket-types/${ticketTypeId}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}

// Student Sale Links
export async function generateStudentLinks(eventId) {
  const res = await fetch(`${API_BASE_URL}/ticket-events/${eventId}/generate-student-links`, {
    method: 'POST',
  });
  return handleResponse(res);
}

export async function getStudentSaleLinks(eventId) {
  const res = await fetch(`${API_BASE_URL}/student-sale-links?event_id=${eventId}`);
  return handleResponse(res);
}

export async function getEventByStudentCode(code) {
  const res = await fetch(`${API_BASE_URL}/student-sale-links/${code}`);
  return handleResponse(res);
}

// Orders

export async function importRoster(ensembleId, students) {
  const res = await fetch(`${API_BASE_URL}/roster/bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ensemble_id: ensembleId, students }),
  });
  return handleResponse(res);
}

export async function createOrder(orderData) {
  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });
  return handleResponse(res);
}

export async function getOrder(orderId) {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}`);
  return handleResponse(res);
}

export async function getOrders(eventId) {
  const res = await fetch(`${API_BASE_URL}/orders?event_id=${eventId}`);
  return handleResponse(res);
}

// Reports
export async function getStudentSalesReport(eventId) {
  const res = await fetch(`${API_BASE_URL}/reports/student-sales?event_id=${eventId}`);
  return handleResponse(res);
}

export async function getEventSummary(eventId) {
  const res = await fetch(`${API_BASE_URL}/reports/event-summary?event_id=${eventId}`);
  return handleResponse(res);
}

// ─────────────── ENSEMBLE SECTIONS & PARTS ───────────────

// Get sections for an ensemble
export async function getEnsembleSections(ensembleId) {
  const res = await fetch(`${API_BASE_URL}/ensemble-sections?ensemble_id=${ensembleId}`);
  return handleResponse(res);
}

// Create a section
export async function createEnsembleSection(data) {
  const res = await fetch(`${API_BASE_URL}/ensemble-sections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// Update a section
export async function updateEnsembleSection(id, data) {
  const res = await fetch(`${API_BASE_URL}/ensemble-sections/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// Delete a section
export async function deleteEnsembleSection(id) {
  const res = await fetch(`${API_BASE_URL}/ensemble-sections/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}

// Get parts for a section or ensemble
export async function getEnsembleParts(params) {
  const query = params.section_id
    ? `section_id=${params.section_id}`
    : `ensemble_id=${params.ensemble_id}`;
  const res = await fetch(`${API_BASE_URL}/ensemble-parts?${query}`);
  return handleResponse(res);
}

// Create a part
export async function createEnsemblePart(data) {
  const res = await fetch(`${API_BASE_URL}/ensemble-parts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// Update a part
export async function updateEnsemblePart(id, data) {
  const res = await fetch(`${API_BASE_URL}/ensemble-parts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// Delete a part
export async function deleteEnsemblePart(id) {
  const res = await fetch(`${API_BASE_URL}/ensemble-parts/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}
