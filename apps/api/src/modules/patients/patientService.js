// src/modules/patients/patientService.js
import mongoose from "mongoose";
import * as repo from "./patientRepository.js";
import MRNCounter from "./mrnCounterModel.js";

const asObjectId = (v) => new mongoose.Types.ObjectId(String(v));
const isValidObjectId = (v) => mongoose.Types.ObjectId.isValid(String(v));

function toDateMaybe(input) {
  if (!input) return undefined;
  const d =
    input.length === 10 ? new Date(`${input}T00:00:00.000Z`) : new Date(input);
  return isNaN(d) ? undefined : d;
}

function ensureBranch(ctx) {
  if (!ctx?.branchId) {
    const err = new Error("X-Branch-Id required");
    err.status = 400;
    throw err;
  }
  if (!isValidObjectId(ctx.branchId)) {
    const err = new Error("X-Branch-Id must be a valid ObjectId");
    err.status = 400;
    throw err;
  }
}

async function nextMRN(branchId) {
  const c = await MRNCounter.findOneAndUpdate(
    { branchId: asObjectId(branchId) },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true, lean: true }
  );
  const y = new Date().getFullYear().toString().slice(-2);
  const n = String(c.seq).padStart(5, "0");
  return `P${y}-${n}`;
}

export async function createPatient({ body, user, ctx, audit }) {
  // For creates, we must know the target branch
  ensureBranch(ctx);

  const doc = {
    ...body,
    branchId: asObjectId(ctx.branchId),
    createdBy: user?.sub ? asObjectId(user.sub) : undefined,
    updatedBy: user?.sub ? asObjectId(user.sub) : undefined,
  };

  if (body.dob) doc.dob = toDateMaybe(body.dob);
  if (!body.mrn || !body.mrn.trim()) doc.mrn = await nextMRN(ctx.branchId);

  return repo.create(doc);
}

export async function getPatient({ id }) {
  return repo.findById(id);
}

export async function updatePatient({ id, body, user }) {
  const update = {
    ...body,
    updatedBy: user?.sub ? asObjectId(user.sub) : undefined,
  };
  if (body.dob) update.dob = toDateMaybe(body.dob);
  return repo.updateById(id, update);
}

export async function searchPatients({ query, user, ctx }) {
  const isSuper =
    Array.isArray(user?.roles) && user.roles.includes("SUPER_ADMIN");

  const filter = {};
  // SUPER_ADMIN:
  // - if scope=all => global
  // - else: if header provided, filter to that branch; if not, allow global
  if (!isSuper) {
    // Non-super MUST be branch-scoped
    ensureBranch(ctx);
    filter.branchId = asObjectId(ctx.branchId);
  } else if (query.scope === "all") {
    // leave filter empty (global)
  } else if (ctx?.branchId && isValidObjectId(ctx.branchId)) {
    filter.branchId = asObjectId(ctx.branchId);
  }

  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(query.limit || 20)));

  return repo.search({
    filter,
    q: query.q,
    mrn: query.mrn,
    phone: query.phone,
    dob: query.dob,
    page,
    limit,
  });
}
