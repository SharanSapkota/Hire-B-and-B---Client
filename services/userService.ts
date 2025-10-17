import { UserSignupPayload } from "@/interface/user-interface";

export const signUp = async (payload: UserSignupPayload) => {
    const {firstName, secondName, lastName, phone, dob, email, password, role } = payload;
    try {
        const response: any = await axios.post(`${process.env.API_BASE_URL || "http://localhost:4000/api"}/signup`, {
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