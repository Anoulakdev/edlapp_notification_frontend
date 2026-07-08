import { z } from "zod";

export const problemdocBaseSchema = z.object({
  fullName: z.string().trim().min(1, "ກະລຸນາໃສ່ຊື່ ແລະ ນາມສະກຸນ"),
  tel: z.string().trim().min(1, "ກະລຸນາໃສ່ເບີໂທລະສັບ"),
  description: z.string().optional(),
  problemtypeId: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number({ message: "ກະລຸນາເລືອກປະເພດບັນຫາ" })
  ),
  provinceId: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number({ message: "ກະລຸນາເລືອກແຂວງ" })
  ),
  districtId: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number({ message: "ກະລຸນາເລືອກເມືອງ" })
  ),
  villageId: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number({ message: "ກະລຸນາເລືອກບ້ານ" })
  ),
  lat: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number({ message: "ກະລຸນາໃສ່ເສັ້ນຂະໜານ (Latitude)" })
  ),
  lng: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number({ message: "ກະລຸນາໃສ່ເສັ້ນແວງ (Longitude)" })
  ),
});

export const createProblemdocSchema = problemdocBaseSchema.extend({
  file: z.any().optional(),
});

export const editProblemdocSchema = problemdocBaseSchema.extend({
  file: z.any().optional(),
});

export const problemDocSchema = z.object({
  id: z.number(),
  fullName: z.string(),
  tel: z.string(),
  description: z.string().optional().nullable(),
  lat: z.number(),
  lng: z.number(),
  problemImg: z.string().optional().nullable(),
  provinceId: z.number(),
  districtId: z.number(),
  villageId: z.number(),
  sourcetypeId: z.number(),
  problemtypeId: z.number(),
  problemstatusId: z.number(),
  createdById: z.number(),
  createdName: z.string().optional().nullable(),
  createdTel: z.string().optional().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  province: z
    .object({
      id: z.number(),
      province_name: z.string(),
    })
    .nullable()
    .optional(),
  district: z
    .object({
      id: z.number(),
      district_name: z.string(),
    })
    .nullable()
    .optional(),
  village: z
    .object({
      id: z.number(),
      village_name: z.string(),
    })
    .nullable()
    .optional(),
  problemtype: z
    .object({
      id: z.number(),
      name: z.string(),
    })
    .nullable()
    .optional(),
  sourcetype: z
    .object({
      id: z.number(),
      name: z.string(),
    })
    .nullable()
    .optional(),
  problemstatus: z
    .object({
      id: z.number(),
      name: z.string(),
      name_edlapp: z.string(),
    })
    .nullable()
    .optional(),
  createdBy: z
    .object({
      id: z.number(),
      employee: z
        .object({
          first_name: z.string(),
          last_name: z.string(),
          emp_code: z.string(),
        })
        .nullable()
        .optional(),
      username: z.string().optional().nullable(),
    })
    .nullable()
    .optional(),
  problemAssigns: z
    .object({
      id: z.number(),
      problemId: z.number(),
      userReceiverId: z.number().nullable().optional(),
      userActiveId: z.number().nullable().optional(),
      commentText: z.string().nullable().optional(),
      commentAudio: z.string().nullable().optional(),
      commentImg: z.string().nullable().optional(),
      createdAt: z.string(),
      updatedAt: z.string(),
      userReceiver: z
        .object({
          id: z.number(),
          employee: z
            .object({
              id: z.number(),
              first_name: z.string(),
              last_name: z.string(),
              gender: z.string().nullable().optional(),
              emp_code: z.string(),
              tel: z.string().nullable().optional(),
            })
            .nullable()
            .optional(),
        })
        .nullable()
        .optional(),
      userActive: z
        .object({
          id: z.number(),
          employee: z
            .object({
              id: z.number(),
              first_name: z.string(),
              last_name: z.string(),
              gender: z.string().nullable().optional(),
              emp_code: z.string(),
              tel: z.string().nullable().optional(),
            })
            .nullable()
            .optional(),
        })
        .nullable()
        .optional(),
    })
    .nullable()
    .optional(),
});

export type ProblemDoc = z.infer<typeof problemDocSchema>;
