const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export async function fetchComplaintsApi(severityFilter = '', productTypeFilter = '') {
  let url = `${API_BASE}/complaints?`;
  if (severityFilter) url += `severity=${encodeURIComponent(severityFilter)}&`;
  if (productTypeFilter) url += `product_type=${encodeURIComponent(productTypeFilter)}&`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch complaints');
  return await res.json();
}

export async function fetchComplaintByIdApi(id) {
  const res = await fetch(`${API_BASE}/complaints/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch complaint ${id}`);
  return await res.json();
}

export async function ingestComplaintApi(data, isFile = false) {
  let options = {};
  if (isFile) {
    options = {
      method: 'POST',
      body: data // FormData object
    };
  } else {
    options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
  }

  const res = await fetch(`${API_BASE}/complaints/ingest`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Ingestion failed' }));
    throw new Error(err.detail || 'Ingestion failed');
  }
  return await res.json();
}

export async function reassessComplaintApi(id, modelName) {
  const res = await fetch(`${API_BASE}/complaints/${id}/reassess?model_name=${encodeURIComponent(modelName)}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to re-assess complaint');
  return await res.json();
}

export async function fetchAnalyticsApi() {
  const res = await fetch(`${API_BASE}/analytics`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return await res.json();
}
