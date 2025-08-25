import { z } from "zod";

export const createPatientSchema = z.object({
  body: z.object({
    mrn: z.string().trim().min(1).optional(), // auto if missing
    name: z
      .object({
        first: z.string().trim().min(1),
        middle: z.string().trim().optional(),
        last: z.string().trim().optional(),
        full: z.string().trim().optional(),
      })
      .required(),
    dob: z.string().datetime().or(z.string().trim().min(1)).optional(), // accept ISO or "YYYY-MM-DD"; service will parse
    sex: z.enum(["M", "F", "O", "U"]).optional(),
    phones: z.array(z.string().trim()).optional(),
    email: z.string().email().optional(),
    addresses: z
      .array(
        z.object({
          line1: z.string().trim().optional(),
          line2: z.string().trim().optional(),
          city: z.string().trim().optional(),
          state: z.string().trim().optional(),
          postalCode: z.string().trim().optional(),
          country: z.string().trim().optional(),
        })
      )
      .optional(),
    alerts: z.array(z.string().trim()).optional(),
    consents: z
      .array(
        z.object({
          type: z.string().trim(),
          givenAt: z.string().datetime().optional(),
          by: z.string().trim().optional(),
        })
      )
      .optional(),
  }),
});

export const updatePatientSchema = z.object({
  body: z.object({
    name: z
      .object({
        first: z.string().trim().optional(),
        middle: z.string().trim().optional(),
        last: z.string().trim().optional(),
        full: z.string().trim().optional(),
      })
      .optional(),
    dob: z.string().datetime().or(z.string().trim().min(1)).optional(),
    sex: z.enum(["M", "F", "O", "U"]).optional(),
    phones: z.array(z.string().trim()).optional(),
    email: z.string().email().optional(),
    addresses: z
      .array(
        z.object({
          line1: z.string().trim().optional(),
          line2: z.string().trim().optional(),
          city: z.string().trim().optional(),
          state: z.string().trim().optional(),
          postalCode: z.string().trim().optional(),
          country: z.string().trim().optional(),
        })
      )
      .optional(),
    alerts: z.array(z.string().trim()).optional(),
    consents: z
      .array(
        z.object({
          type: z.string().trim(),
          givenAt: z.string().datetime().optional(),
          by: z.string().trim().optional(),
        })
      )
      .optional(),
  }),
  params: z.object({ id: z.string().min(1) }),
});

export const searchPatientsSchema = z.object({
  query: z.object({
    q: z.string().trim().optional(),
    mrn: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    dob: z.string().trim().optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    scope: z.enum(["all"]).optional(), // SUPER_ADMIN only
  }),
});
