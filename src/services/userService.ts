import axiosCall from "@/components/axios/app";
import { UserSignupPayload } from "@/interface/user-interface";
import axios from "axios";

export const signUp = async (payload: UserSignupPayload) => {
    const {firstName, secondName, lastName, phone, dob, email, password, role } = payload;

    try {
        console.log("API_BASE_URL:", process.env);
        return await axiosCall.post('auth/signup', payload);

    } catch (error: any) {
        return { success: false, error: error.message || "Signup failed" };
    }
}