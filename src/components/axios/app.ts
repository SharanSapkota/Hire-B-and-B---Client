import { get } from "http"
import axios from "axios"


const axiosCall = {
    get: async (endpoint: string) => {
        const response = await axios.get(`${process.env.API_BASE_URL || "http://localhost:4000/api"}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data;
    },
    post: async (endpoint: string, data: any) => {
        const response = await axios.post(`${process.env.API_BASE_URL || "http://localhost:4000/api"}${endpoint}`, data, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        return response.data;
}}

export default axiosCall

