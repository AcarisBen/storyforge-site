const BASE_URL = 'http://localhost:3000/api';

const apiClient = {
  async get(endpoint) {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    if (!response.ok) throw new Error(`Erro: ${response.status}`);
    const data = await response.json();
    return { data };
  },

  async post(endpoint, body) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`Erro: ${response.status}`);
    const data = await response.json();
    return { data };
  },
};

export default apiClient;