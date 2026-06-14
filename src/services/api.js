import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login') && !originalRequest.url.includes('/auth/refresh')) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');
        
        const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refresh_token: refreshToken });
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  refresh: (data) => api.post('/auth/refresh', data),
};

// Dashboard
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getSalesTrend: (days = 30) => api.get(`/dashboard/sales-trend?days=${days}`),
  getRecentActivities: () => api.get('/dashboard/recent-activities'),
  getNotifications: () => api.get('/dashboard/notifications'),
  getTopProducts: () => api.get('/dashboard/top-products'),
};

// CRUD factory
const createCRUD = (resource) => ({
  list: (params = {}) => api.get(`/${resource}/`, { params }),
  get: (id) => api.get(`/${resource}/${id}`),
  create: (data) => api.post(`/${resource}/`, data),
  update: (id, data) => api.put(`/${resource}/${id}`, data),
  delete: (id) => api.delete(`/${resource}/${id}`),
});

export const usersAPI = { ...createCRUD('users'), resetPassword: (id, data) => api.post(`/users/${id}/reset-password`, data), forceLogout: (id) => api.post(`/users/${id}/force-logout`) };
export const rolesAPI = { ...createCRUD('roles'), listPermissions: () => api.get('/roles/permissions'), assignPermissions: (roleId, data) => api.post(`/roles/${roleId}/permissions`, data) };
export const companiesAPI = createCRUD('companies');
export const branchesAPI = createCRUD('branches');
export const franchisesAPI = { ...createCRUD('franchises'), approve: (id) => api.post(`/franchises/${id}/approve`), suspend: (id) => api.post(`/franchises/${id}/suspend`) };
export const warehousesAPI = createCRUD('warehouses');
export const productsAPI = createCRUD('products');
export const categoriesAPI = createCRUD('categories');
export const brandsAPI = createCRUD('brands');
export const unitsAPI = createCRUD('units');
export const variantsAPI = createCRUD('variants');
export const customersAPI = createCRUD('customers');
export const vendorsAPI = createCRUD('vendors');
export const auditLogsAPI = { list: (params = {}) => api.get('/audit-logs/', { params }) };
export const inventoryAPI = createCRUD('inventory');
export default api;
