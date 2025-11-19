const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://opus-backend-production.up.railway.app';

export async function createEnsemble(payload) {
  const response = await fetch(`${API_BASE_URL}/ensembles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to create ensemble');
  }

  return response.json();
}

