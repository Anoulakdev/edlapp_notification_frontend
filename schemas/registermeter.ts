import { z } from "zod";

export const registermeterBaseSchema = z.object({
  fullName: z.string().trim().min(1, "ກະລຸນາໃສ່ຊື່ ແລະ ນາມສະກຸນ"),
  phone: z.string().trim().min(1, "ກະລຸນາໃສ່ເບີໂທລະສັບ"),
  accountNear: z.string().trim().min(1, "ກະລຸນາໃສ່ບັນຊີໃກ້ຄຽງ"),
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
    z.number().optional()
  ),
  lng: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number().optional()
  ),
});

export const createRegistermeterSchema = registermeterBaseSchema.extend({
  billNearImg: z.any().optional(),
  idcardImg: z.any().optional(),
});

export const editRegistermeterSchema = registermeterBaseSchema.extend({
  billNearImg: z.any().optional(),
  idcardImg: z.any().optional(),
});

export const registerMeterSchema = z.object({
  id: z.number(),
  fullName: z.string(),
  phone: z.string(),
  accountNear: z.string(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  billNearImg: z.string().optional().nullable(),
  idcardImg: z.string().optional().nullable(),
  provinceId: z.number(),
  districtId: z.number(),
  villageId: z.number(),
  sourcetypeId: z.number(),
  meterStatusId: z.number(),
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
  sourcetype: z
    .object({
      id: z.number(),
      name: z.string(),
    })
    .nullable()
    .optional(),
  meterStatus: z
    .object({
      id: z.number(),
      edlapp: z.string().nullable().optional(),
      callcenter: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  userAcceptMeters: z
    .object({
      id: z.number(),
      meterId: z.number(),
      userCallId: z.number().nullable().optional(),
      userProvinceId: z.number().nullable().optional(),
      createdAt: z.string(),
      updatedAt: z.string(),
      userCall: z
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
      userProvince: z
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

export type RegisterMeter = z.infer<typeof registerMeterSchema>;
