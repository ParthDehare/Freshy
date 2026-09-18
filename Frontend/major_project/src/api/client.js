import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('freshchain_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  login: (credentials) => client.post('/auth/login', credentials),
  getCurrentUser: () => client.get('/auth/me'),
};

export const shipmentAPI = {
  getAll: (params) => client.get('/shipments', { params }),
  getById: (id) => client.get(`/shipments/${id}`),
  create: (data) => client.post('/shipments/add', data),
  updateStatus: (id, status) => client.patch(`/shipments/${id}/status`, { status }),
};

export const scanAPI = {
  getAll: () => client.get('/scans'),
  getByShipment: (shipmentId) => client.get(`/scans/${shipmentId}`),
  create: (data) => client.post('/scans/add', data),
  predictAndExplain: (formData) => client.post('/scans/predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  }),
};

export const statsAPI = {
  getSystemStats: () => client.get('/stats'),
};

export const userAPI = {
  getAll: () => client.get('/users'),
};

export default client;
