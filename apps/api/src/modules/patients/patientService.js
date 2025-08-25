import mongoose from "mongoose";
import * as repo from "./patientRepository.js";
import MRNCounter from "./mrnCounterModel.js";

function toDateMaybe(input) {
  if (!input) return undefined;
  // allow YYYY-MM-DD or ISO
  const d =
    input.length === 10 ? new Date(`${input}T00:00:00.000Z`) : new Date(input);
  return isNaN(d) ? undefined : d;
}

function ensureBranch(ctx) {
  if (!ctx?.branchId) {
    const err = new Error("Branch context missing");
    err.status = 400;
    throw err;
  }
}

async function nextMRN(branchId) {
  // atomic per-branch increment
  const c = await MRNCounter.findOneAndUpdate(
    { branchId: new mongoose.Types.ObjectId(branchId) },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true, lean: true }
  );
  const y = new Date().getFullYear().toString().slice(-2);
  const n = String(c.seq).padStart(5, "0");
  return `P${y}-${n}`; // e.g., P25-00001
}

export async function createPatient({ body, user, ctx, audit }) {
  ensureBranch(ctx);

  const doc = {
    ...body,
    branchId: ctx.branchId,
    createdBy: user?._id,
    updatedBy: user?._id,
  };

  if (body.dob) doc.dob = toDateMaybe(body.dob);

  if (!body.mrn || !body.mrn.trim()) {
    doc.mrn = await nextMRN(ctx.branchId);
  }

  return await repo.create(doc);
}

export async function getPatient({ id }) {
  return await repo.findById(id);
}

export async function updatePatient({ id, body, user }) {
  const update = { ...body, updatedBy: user?._id };
  if (body.dob) update.dob = toDateMaybe(body.dob);
  return await repo.updateById(id, update);
}

export async function searchPatients({ query, user, ctx }) {
  let filter = {};
  // SUPER_ADMIN may pass ?scope=all to see cross-branch
  const isSuper = user?.roles?.includes("SUPER_ADMIN");
  if (!isSuper || query.scope !== "all") {
    ensureBranch(ctx);
    filter.branchId = ctx.branchId;
  }

  const page = Number(query.page || 1);
  const limit = Math.min(Number(query.limit || 20), 100);

  return await repo.search({
    filter,
    q: query.q,
    mrn: query.mrn,
    phone: query.phone,
    dob: query.dob,
    page,
    limit,
  });
}
