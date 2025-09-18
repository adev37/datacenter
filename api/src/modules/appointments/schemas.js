// api/src/modules/appointments/schemas.js
import { z } from "zod";

const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/); // "YYYY-MM-DD"
const hm = z.string().regex(/^\d{2}:\d{2}$/); // "HH:mm"
export const statusEnum = z.enum([
  "scheduled",
  "confirmed",
  "in-progress",
  "completed",
  "cancelled",
  "no-show",
]);

export const listAppointmentsSchema = {
  query: z.object({
    dateFrom: ymd.optional(),
    dateTo: ymd.optional(),
    doctorId: z.string().optional(),
    department: z.string().optional(),
    status: statusEnum.optional(),
    q: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
};

export const createAppointmentSchema = {
  body: z.object({
    date: ymd,
    time: hm,
    durationMin: z.coerce.number().int().min(5).max(240).default(30),
    doctorId: z.string(),
    doctor: z
      .object({
        id: z.string().optional(),
        name: z.string().optional(),
        department: z.string().optional(),
      })
      .optional(),
    patientId: z.string().optional(),
    patient: z
      .object({
        id: z.string().optional(),
        mrn: z.string().optional(),
        name: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
      })
      .optional(),
    type: z.string().default("consultation"),
    priority: z
      .enum(["low", "normal", "high", "urgent", "emergency"])
      .default("normal"),
    notes: z.string().optional(),
    symptoms: z.string().optional(),
    referredBy: z.string().optional(),
    insuranceProvider: z.string().optional(),
    copayAmount: z.coerce.number().min(0).optional(),
  }),
};

export const updateAppointmentSchema = {
  params: z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/) }),
  body: createAppointmentSchema.body.partial(),
};

export const setStatusSchema = {
  params: z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/) }),
  body: z.object({ status: statusEnum }),
};

export const getScheduleSchema = {
  query: z.object({
    doctorId: z.string(),
    from: ymd,
    to: ymd,
  }),
};

export const upsertTemplateSchema = {
  body: z.object({
    doctorId: z.string(),
    dayOfWeek: z.number().int().min(0).max(6),
    slots: z
      .array(
        z.object({
          from: hm,
          to: hm,
          stepMin: z.number().int().min(5).max(120).default(30),
        })
      )
      .default([]),
    breaks: z.array(z.object({ from: hm, to: hm })).default([]),
    exceptions: z
      .array(
        z.object({
          date: ymd,
          blocks: z.array(z.object({ from: hm, to: hm })).default([]),
        })
      )
      .default([]),
  }),
};

export const createBlockSchema = {
  body: z.object({
    doctorId: z.string(),
    date: ymd,
    from: hm,
    to: hm,
    reason: z.string().optional(),
  }),
};
