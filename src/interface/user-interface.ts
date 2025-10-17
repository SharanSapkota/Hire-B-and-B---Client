interface IUser {
  id: string
  firstName: string
  lastName: string
  secondName?: string
  dob: string
  phone: string
  email: string
  password: string
  role: string
  verified: boolean

  rating: number
}

export interface UserSignupPayload extends Omit<IUser, "id" | "verified" | "rating"> {
}
