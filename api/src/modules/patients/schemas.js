// ESM
import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/);

export const createPatientSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(1),
    middleName: z.string().trim().optional().default(""),
    lastName: z.string().trim().min(1),
    dob: z.coerce.date(),
    gender: z.enum(["Male", "Female", "Other"]),
    maritalStatus: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    photoUrl: z.string().url().optional(),
    insurance: z
      .object({
        provider: z.string().optional(),
        plan: z.string().optional(),
        policyNo: z.string().optional(),
        coverage: z.string().optional(),
      })
      .optional(),
    emergency: z
      .object({
        name: z.string().optional(),
        relationship: z.string().optional(),
        phone: z.string().optional(),
      })
      .optional(),
  }),
});

export const updatePatientSchema = z.object({
  params: z.object({ id: objectId }),
  body: createPatientSchema.shape.body.partial().extend({
    status: z.enum(["active", "inactive", "deceased"]).optional(),
    mrn: z.string().optional(),
    isDeleted: z.boolean().optional(),
  }),
});

export const listPatientsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    gender: z.enum(["Male", "Female", "Other"]).optional(),
    status: z.enum(["active", "inactive", "deceased"]).optional(),
    sort: z.enum(["name", "mrn", "lastVisit"]).optional().default("name"),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
  }),
});
