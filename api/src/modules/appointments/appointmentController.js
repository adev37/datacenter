// ESM
import Appointment from "./appointmentModel.js";
import Patient from "#modules/patients/patientModel.js"; // for snapshot (optional)

/** same resolver as schedules */
function resolveBranchId(req, { allowUnscoped = false } = {}) {
  const roles = Array.isArray(req.user?.roles) ? req.user.roles : [];
  const isSuper = roles.includes("SUPER_ADMIN") || roles.includes("ADMIN");
  const header = req.get?.("x-branch-id") || req.header?.("X-Branch-Id");
  if (header) return String(header);
  if (allowUnscoped && isSuper) return null;
  const ctx = req.ctx?.branchId;
  if (!ctx) {
    const err = new Error("Branch context required");
    err.status = 400;
    throw err;
  }
  return ctx;
}

const toMinutes = (hhmm) => {
  const [h, m] = String(hhmm)
    .split(":")
    .map((x) => parseInt(x, 10));
  return (h || 0) * 60 + (m || 0);
};
const overlap = (aStart, aDur, bStart, bDur) => {
  const a0 = toMinutes(aStart),
    a1 = a0 + aDur;
  const b0 = toMinutes(bStart),
    b1 = b0 + bDur;
  return a0 < b1 && b0 < a1;
};

function tokenFor(dept = "GEN") {
  const p = (Math.floor(Math.random() * 999) + 1).toString().padStart(3, "0");
  return `${String(dept || "GEN")
    .slice(0, 3)
    .toUpperCase()}${p}`;
}

/** GET /api/v1/appointments */
export async function list(req, res, next) {
  try {
    const branchId = resolveBranchId(req, { allowUnscoped: true });
    const {
      dateFrom,
      dateTo,
      doctorId,
      department,
      status,
      q,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = { ...(branchId ? { branchId } : {}) };
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = String(dateFrom);
      if (dateTo) filter.date.$lte = String(dateTo);
    }
    if (doctorId) filter.doctorId = String(doctorId);
    if (status) filter.status = String(status);
    if (department) filter["doctor.department"] = String(department);
    if (q) {
      const rx = new RegExp(String(q), "i");
      filter.$or = [
        { "patient.name": rx },
        { "patient.phone": rx },
        { tokenNumber: rx },
      ];
    }

    const skip = (Math.max(1, Number(page)) - 1) * Math.max(1, Number(limit));
    const lim = Math.min(100, Math.max(1, Number(limit)));

    const [total, items] = await Promise.all([
      Appointment.countDocuments(filter),
      Appointment.find(filter)
        .sort({ date: 1, time: 1 })
        .skip(skip)
        .limit(lim)
        .lean(),
    ]);

    res.json({ total, page: Number(page), limit: lim, items });
  } catch (e) {
    next(e);
  }
}

/** POST /api/v1/appointments  (conflict-safe) */
export async function create(req, res, next) {
  try {
    const branchId = resolveBranchId(req);
    const {
      date,
      time,
      durationMin = 30,
      doctorId,
      doctor = {},
      patientId,
      patient = {},
      type = "consultation",
      priority = "normal",
      notes,
      symptoms,
      referredBy,
      insuranceProvider,
      copayAmount,
    } = req.body || {};

    if (!date || !time || !doctorId) {
      return res
        .status(400)
        .json({ message: "date, time, doctorId are required" });
    }

    // patient snapshot (optional)
    let patientSnap = patient;
    if (!patientSnap?.name && patientId) {
      const p = await Patient.findById(patientId).lean();
      if (p) {
        patientSnap = {
          id: String(p._id),
          mrn: p.mrn,
          name: [p.firstName, p.middleName, p.lastName]
            .filter(Boolean)
            .join(" "),
          phone: p.phone,
          email: p.email,
        };
      }
    }

    // conflict detection: same branch+doctor+date with time overlap
    const sameDay = await Appointment.find({
      branchId,
      doctorId,
      date,
      status: { $in: ["scheduled", "confirmed", "in-progress"] },
    }).lean();

    const hasClash = sameDay.some((a) =>
      overlap(
        time,
        Number(durationMin || 30),
        a.time,
        Number(a.durationMin || 30)
      )
    );
    if (hasClash) {
      return res.status(409).json({ message: "Time slot already booked" });
    }

    const dept = doctor?.department || "GEN";
    const tokenNumber = tokenFor(dept);

    const doc = await Appointment.create({
      branchId,
      date,
      time,
      durationMin,
      status: "scheduled",
      type,
      priority,
      doctorId,
      doctor,
      patientId: patientId || undefined,
      patient: patientSnap || {},
      tokenNumber,
      notes,
      symptoms,
      referredBy,
      insuranceProvider,
      copayAmount: copayAmount != null ? Number(copayAmount) : undefined,
      createdBy: String(req.user?.sub || ""),
      meta: { source: "web" },
    });

    res.status(201).json(doc);
  } catch (e) {
    next(e);
  }
}

/** PATCH /api/v1/appointments/:id  (edit details + recheck conflicts if time changed) */
export async function update(req, res, next) {
  try {
    const branchId = resolveBranchId(req);
    const { id } = req.params;
    const payload = { ...req.body };
    delete payload._id;

    // if time/date/doctor changed, re-check conflict
    if (
      payload.date ||
      payload.time ||
      payload.doctorId ||
      payload.durationMin
    ) {
      const current = await Appointment.findOne({
        _id: id,
        ...(branchId ? { branchId } : {}),
      });
      if (!current)
        return res.status(404).json({ message: "Appointment not found" });

      const date = payload.date || current.date;
      const time = payload.time || current.time;
      const durationMin = Number(
        payload.durationMin || current.durationMin || 30
      );
      const doctorId = payload.doctorId || current.doctorId;

      const sameDay = await Appointment.find({
        _id: { $ne: id },
        branchId,
        doctorId,
        date,
        status: { $in: ["scheduled", "confirmed", "in-progress"] },
      }).lean();
      const hasClash = sameDay.some((a) =>
        overlap(time, durationMin, a.time, Number(a.durationMin || 30))
      );
      if (hasClash)
        return res.status(409).json({ message: "Time slot already booked" });
    }

    const doc = await Appointment.findOneAndUpdate(
      { _id: id, ...(branchId ? { branchId } : {}) },
      { $set: payload },
      { new: true }
    ).lean();

    if (!doc) return res.status(404).json({ message: "Appointment not found" });
    res.json(doc);
  } catch (e) {
    next(e);
  }
}

/** POST /api/v1/appointments/:id/status  (guard transitions) */
export async function setStatus(req, res, next) {
  try {
    const branchId = resolveBranchId(req);
    const { id } = req.params;
    const { status } = req.body || {};
    const allowed = [
      "scheduled",
      "confirmed",
      "in-progress",
      "completed",
      "cancelled",
      "no-show",
    ];
    if (!allowed.includes(String(status)))
      return res.status(400).json({ message: "Invalid status" });

    const doc = await Appointment.findOne({
      _id: id,
      ...(branchId ? { branchId } : {}),
    });
    if (!doc) return res.status(404).json({ message: "Appointment not found" });

    const from = doc.status;
    const can =
      (from === "scheduled" &&
        ["confirmed", "in-progress", "cancelled", "no-show"].includes(
          status
        )) ||
      (from === "confirmed" &&
        ["in-progress", "cancelled", "no-show"].includes(status)) ||
      (from === "in-progress" && ["completed"].includes(status)) ||
      from === status; // idempotent

    if (!can)
      return res
        .status(400)
        .json({ message: `Cannot transition ${from} → ${status}` });

    const patch = { status };
    if (status === "in-progress") patch.startedAt = new Date();
    if (status === "completed") patch.completedAt = new Date();
    if (status === "cancelled") {
      patch.cancelledAt = new Date();
      patch.cancelledBy = String(req.user?.sub || "");
    }

    await Appointment.updateOne({ _id: id }, { $set: patch });
    const out = await Appointment.findById(id).lean();
    res.json(out);
  } catch (e) {
    next(e);
  }
}
