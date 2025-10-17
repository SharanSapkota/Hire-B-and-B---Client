import { UserSignupPayload } from "@/interface/user-interface";
import axios from "axios";

export const signUp = async (payload: UserSignupPayload) => {
    const {firstName, secondName, lastName, phone, dob, email, password, role } = payload;

    try {
        console.log("API_BASE_URL:", process.env);
        const response: any = await axios.post(`${process.env.API_BASE_URL + '/auth' || "http://localhost:4000/api/auth"}/signup`, {
            firstName,
            secondName,
            lastName,
            dob,
            phone,
            email,
            password,
            role
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data;
    } catch (error: any) {
        return { success: false, error: error.message || "Signup failed" };
    }
}