import axios from 'axios';

const BASE_URL = import.meta.env.MODE === 'development' ? "http://localhost:4000/api/v1" : "/api/v1";

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

export default axiosInstance;