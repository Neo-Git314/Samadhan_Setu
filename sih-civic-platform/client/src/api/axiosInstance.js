import axios from 'axios';

// TODO: Configure shared axios client options and interceptors.
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true
});

export default axiosInstance;
