// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const API_BASE_URL = "https://api-inventory.isavralabel.com/pkk-sungai-ulin";

async function apiRequest(path, { method = 'GET', body, isFormData = false } = {}) {
  const headers = {};

  let finalBody = body;
  if (body && !isFormData) {
    headers['Content-Type'] = 'application/json';
    finalBody = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: finalBody,
  });

  if (!res.ok) {
    let message = 'Terjadi kesalahan saat menghubungi server';
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch (_) {
      // ignore JSON parse error
    }
    throw new Error(message);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return res.text();
}

export const authApi = {
  login(username, password) {
    return apiRequest('/api/login', {
      method: 'POST',
      body: { username, password },
    });
  },
};

export const suratMasukApi = {
  list({ page = 1, perPage = 10 } = {}) {
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
    });
    return apiRequest(`/api/surat-masuk?${params.toString()}`);
  },
  create(payload) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    return apiRequest('/api/surat-masuk', {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  },
  update(id, payload) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    return apiRequest(`/api/surat-masuk/${id}`, {
      method: 'PUT',
      body: formData,
      isFormData: true,
    });
  },
  remove(id) {
    return apiRequest(`/api/surat-masuk/${id}`, {
      method: 'DELETE',
    });
  },
};

export const suratKeluarApi = {
  list({ page = 1, perPage = 10 } = {}) {
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
    });
    return apiRequest(`/api/surat-keluar?${params.toString()}`);
  },
  create(payload) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    return apiRequest('/api/surat-keluar', {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  },
  update(id, payload) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    return apiRequest(`/api/surat-keluar/${id}`, {
      method: 'PUT',
      body: formData,
      isFormData: true,
    });
  },
  remove(id) {
    return apiRequest(`/api/surat-keluar/${id}`, {
      method: 'DELETE',
    });
  },
};

export const disposisiApi = {
  list({ page = 1, perPage = 10 } = {}) {
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
    });
    return apiRequest(`/api/disposisi?${params.toString()}`);
  },
  create(payload) {
    return apiRequest('/api/disposisi', {
      method: 'POST',
      body: payload,
    });
  },
  update(id, payload) {
    return apiRequest(`/api/disposisi/${id}`, {
      method: 'PUT',
      body: payload,
    });
  },
  remove(id) {
    return apiRequest(`/api/disposisi/${id}`, {
      method: 'DELETE',
    });
  },
};

export const statsApi = {
  summary() {
    return apiRequest('/api/stats/summary');
  },
};

export const dashboardApi = {
  overview() {
    return apiRequest('/api/dashboard/overview');
  },
};



