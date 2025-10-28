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
    },
    put: async (endpoint: string, data: any, headers: any) => {
        const response = await axios.put(`${endpoint}`, data, {
            headers: {
                'Content-Type': 'image/jpeg',
            },
        });
        return response.data;
    }

    
}

export async function uploadToS3(file: File, presignedUrl: string) {
  try {
    console.log(file.type)
    const res = await axios.put(presignedUrl, file, {
      headers: {
        "Content-Type": file.type, // ✅ only this one
      },
    });

    console.log("✅ Uploaded to S3:", res);
    return res;
  } catch (err) {
    console.error("❌ Upload failed:", err);
  }
}

export default axiosCall

