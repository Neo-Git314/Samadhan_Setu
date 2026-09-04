import axios from 'axios';

// Central Axios client
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000
});

// Request interceptor: attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('samadhan_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('[API] 401 Unauthorized - clearing token and redirecting to auth');
      localStorage.removeItem('token');
      localStorage.removeItem('samadhan_token');
      localStorage.removeItem('samadhan_user');
      // If we are in browser and not already on auth page
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

// Modular API services

export const authApi = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  }
};

export const complaintsApi = {
  getComplaints: async (params = {}) => {
    const res = await api.get('/complaints', { params });
    return res.data;
  },
  getComplaintById: async (id) => {
    const res = await api.get(`/complaints/${id}`);
    return res.data;
  },
  getDuplicates: async (id) => {
    const res = await api.get(`/complaints/${id}/duplicates`);
    return res.data;
  },
  createComplaint: async (data) => {
    // If FormData, let browser handle Content-Type (multipart/form-data)
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const res = await api.post('/complaints', data, { headers });
    return res.data;
  },
  updateStatus: async (id, status) => {
    const res = await api.patch(`/complaints/${id}/status`, { status });
    return res.data;
  }
};

export const universitiesApi = {
  getUniversities: async () => {
    const res = await api.get('/universities');
    return res.data;
  },
  createUniversity: async (data) => {
    const res = await api.post('/universities', data);
    return res.data;
  },
  getChallenges: async (universityId = 'me') => {
    const res = await api.get(`/universities/${universityId}/challenges`);
    return res.data;
  },
  acceptChallenge: async (universityId, complaintId) => {
    const res = await api.post(`/universities/${universityId}/accept/${complaintId}`);
    return res.data;
  }
};

export const projectsApi = {
  getProjects: async (params = {}) => {
    const res = await api.get('/projects', { params });
    return res.data;
  },
  getProjectById: async (id) => {
    const res = await api.get(`/projects/${id}`);
    return res.data;
  },
  updateMilestones: async (id, payload) => {
    const res = await api.patch(`/projects/${id}/milestones`, payload);
    return res.data;
  },
  updateTeam: async (id, payload) => {
    const res = await api.patch(`/projects/${id}/team`, payload);
    return res.data;
  },
  inviteIndustry: async (id, industryPartnerId) => {
    const res = await api.post(`/projects/${id}/invite-industry`, { industryPartnerId });
    return res.data;
  },
  respondIndustry: async (id, payload) => {
    const res = await api.patch(`/projects/${id}/industry-response`, payload);
    return res.data;
  }
};

export const industryApi = {
  getPartners: async () => {
    const res = await api.get('/industry-partners');
    return res.data;
  },
  createPartner: async (data) => {
    const res = await api.post('/industry-partners', data);
    return res.data;
  }
};

export const analyticsApi = {
  getSummary: async () => {
    const res = await api.get('/analytics/summary');
    return res.data;
  },
  getTrends: async () => {
    const res = await api.get('/analytics/trends');
    return res.data;
  }
};

export const notificationsApi = {
  getNotifications: async (unreadOnly = false) => {
    const res = await api.get('/notifications', {
      params: unreadOnly ? { unreadOnly: true } : {}
    });
    return res.data;
  },
  markRead: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  }
};

export default api;
