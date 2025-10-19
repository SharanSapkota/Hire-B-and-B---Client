import axiosCall from "@/components/axios/app";
import { UserSignupPayload } from "@/interface/user-interface";
import axios from "axios";

export const createBike = async (payload:any ) => {
    const { name, category, description, price, image, condition, ownerId } = payload;

    try {
        console.log("API_BASE_URL:", process.env);
        return await axiosCall.post('/file-upload/presigned', payload);

    } catch (error: any) {
        return { success: false, error: error.message || "Signup failed" };
    }
}

export const getPreSignedUrl = async (fileName: string, fileType: string) => {
    try {
        const response: any = await axiosCall.get(`file-upload/presigned-url?${fileName}&${fileType})`);
        return response.data;
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to get pre-signed URL" };
    }
}