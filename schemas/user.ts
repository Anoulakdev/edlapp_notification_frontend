import { z } from "zod";

export const createUserSchema = z
  .object({
    username: z.string(),
    roleId: z.number(),
    provinceId: z.number().optional(),
    districtId: z.number().optional(),
    branchId: z.number().optional(),
    repairDistrictId: z.number().optional(),
    searching: z.boolean(),
    externalEmployee: z.any().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    const trimmed = data.username.trim();
    if (!trimmed) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "ລະຫັດພະນັກງານ (Employee Code)",
        path: ["username"],
      });
    } else if (data.searching) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "ກຳລັງຄົ້ນຫາຂໍ້ມູນພະນັກງານ, ກະລຸນາລໍຖ້າ...",
        path: ["username"],
      });
    } else if (!data.externalEmployee) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "ບໍ່ພົບຂໍ້ມູນພະນັກງານໃນລະບົບພາຍນອກ",
        path: ["username"],
      });
    }

    if (!data.roleId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "ກະລຸນາເລືອກສິດຜູ້ໃຊ້",
        path: ["roleId"],
      });
    }
  });

export type CreateUserData = z.infer<typeof createUserSchema>;

export const fullUserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  role: z.string(),
  status: z.enum(["Active", "Inactive", "Pending"]),
  department: z.string(),
  division: z.string().optional(),
  position: z.string().optional(),
  empCode: z.string().optional(),
  tel: z.string().optional(),
  joinDate: z.string().optional(),
  avatar: z.string(),
  avatarColor: z.string(),
  empimg: z.string().nullable().optional(),
  provinceId: z.number().nullable().optional(),
  districtId: z.number().nullable().optional(),
  branchId: z.number().nullable().optional(),
  repairDistrictId: z.number().nullable().optional(),
  raw: z.any().optional(),
});

export type User = z.infer<typeof fullUserSchema>;
