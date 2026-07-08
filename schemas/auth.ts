import { z } from "zod";

export const signInSchema = z.object({
  username: z.string().min(1, "ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້"),
  password: z.string().min(4, "ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 4 ຕົວອັກສອນ"),
});

export const signUpSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
