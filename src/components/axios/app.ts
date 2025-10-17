import axios from "axios"

export const API_BASE_URL = 'http://localhost:4000/api';

const axiosCall = {
    get: async (endpoint: string) => {
        console.log("API_BASE_URL:", process.env)
        const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data;
    },
    post: async (endpoint: string, data: any) => {
        const response = await axios.post(`${API_BASE_URL}/${endpoint}`, data, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        return response.data;
}}

export default axiosCall

