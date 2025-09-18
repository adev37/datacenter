// ESM
import ScheduleTemplate from "./scheduleTemplateModel.js";
import ScheduleBlock from "./scheduleBlockModel.js";
import Appointment from "./appointmentModel.js";

/** shared branch resolver (same style as notifications/patients) */
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

const pad2 = (n) => String(n).padStart(2, "0");
const toMinutes = (hhmm) => {
  const [h, m] = String(hhmm)
    .split(":")
    .map((x) => parseInt(x, 10));
  return (h || 0) * 60 + (m || 0);
};
const between = (t, a, b) =>
  toMinutes(t) >= toMinutes(a) && toMinutes(t) < toMinutes(b);
const overlap = (aStart, aDur, bStart, bDur) => {
  const a0 = toMinutes(aStart),
    a1 = a0 + aDur;
  const b0 = toMinutes(bStart),
    b1 = b0 + bDur;
  return a0 < b1 && b0 < a1;
};

function enumerate(from, to, stepMin) {
  const out = [];
  let t = toMinutes(from);
  const end = toMinutes(to);
  while (t < end) {
    const hh = pad2(Math.floor(t / 60));
    const mm = pad2(t % 60);
    out.push(`${hh}:${mm}`);
    t += stepMin;
  }
  return out;
}

/** GET /api/v1/schedules?doctorId=...&from=YYYY-MM-DD&to=YYYY-MM-DD */
export async function getSchedule(req, res, next) {
  try {
    const branchId = resolveBranchId(req, { allowUnscoped: false });
    const { doctorId, from, to } = req.query;
    if (!doctorId || !from || !to) {
      return res
        .status(400)
        .json({ message: "doctorId, from, to are required" });
    }

    // Load templates for all weekdays
    const templates = await ScheduleTemplate.find({
      branchId,
      doctorId,
      dayOfWeek: { $in: [0, 1, 2, 3, 4, 5, 6] },
    }).lean();

    // Collect blocks + appointments in window
    const blocks = await ScheduleBlock.find({
      branchId,
      doctorId,
      date: { $gte: from, $lte: to },
    }).lean();

    const appts = await Appointment.find({
      branchId,
      doctorId,
      date: { $gte: from, $lte: to },
      status: { $in: ["scheduled", "confirmed", "in-progress"] },
    }).lean();

    // Map by date for quick lookups
    const byDateBlocks = new Map();
    blocks.forEach((b) => {
      const arr = byDateBlocks.get(b.date) || [];
      arr.push(b);
      byDateBlocks.set(b.date, arr);
    });
    const byDateAppts = new Map();
    appts.forEach((a) => {
      const arr = byDateAppts.get(a.date) || [];
      arr.push(a);
      byDateAppts.set(a.date, arr);
    });

    // Build days
    const days = [];
    const start = new Date(from);
    const end = new Date(to);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const iso = d.toISOString().slice(0, 10);
      const dow = d.getDay();
      const tpl = templates.find((t) => t.dayOfWeek === dow);

      const slots = [];
      if (tpl && (tpl.slots || []).length) {
        // candidate slots from windows
        for (const w of tpl.slots) {
          const step = Math.max(5, Number(w.stepMin || 30));
          for (const t of enumerate(w.from, w.to, step)) {
            slots.push({ time: t, status: "available" });
          }
        }
        // static breaks
        for (const br of tpl.breaks || []) {
          for (const s of slots) {
            if (between(s.time, br.from, br.to)) s.status = "blocked";
          }
        }
        // exceptions (date blocks)
        const ex = (tpl.exceptions || []).find((e) => e.date === iso);
        if (ex) {
          for (const b of ex.blocks || []) {
            for (const s of slots)
              if (between(s.time, b.from, b.to)) s.status = "blocked";
          }
        }
      }

      // ad-hoc blocks
      for (const b of byDateBlocks.get(iso) || []) {
        for (const s of slots)
          if (between(s.time, b.from, b.to)) s.status = "blocked";
      }

      // mark booked based on overlapping appointments
      for (const a of byDateAppts.get(iso) || []) {
        for (const s of slots) {
          if (
            overlap(s.time, 30, a.time, a.durationMin || 30) &&
            s.status === "available"
          ) {
            s.status = "booked";
          }
        }
      }

      days.push({ date: iso, slots });
    }

    res.json({ days });
  } catch (e) {
    next(e);
  }
}

/** POST /api/v1/schedules/templates (create/update single weekday template) */
export async function upsertTemplate(req, res, next) {
  try {
    const branchId = resolveBranchId(req);
    const {
      doctorId,
      dayOfWeek,
      slots = [],
      breaks = [],
      exceptions = [],
    } = req.body || {};
    if (doctorId == null || dayOfWeek == null) {
      return res
        .status(400)
        .json({ message: "doctorId and dayOfWeek are required" });
    }
    await ScheduleTemplate.updateOne(
      { branchId, doctorId, dayOfWeek },
      { $set: { branchId, doctorId, dayOfWeek, slots, breaks, exceptions } },
      { upsert: true }
    );
    const out = await ScheduleTemplate.findOne({
      branchId,
      doctorId,
      dayOfWeek,
    }).lean();
    res.status(201).json(out);
  } catch (e) {
    next(e);
  }
}

/** POST /api/v1/schedules/blocks  (single-day block; call in a loop for ranges) */
export async function createBlock(req, res, next) {
  try {
    const branchId = resolveBranchId(req);
    const { doctorId, date, from, to, reason } = req.body || {};
    if (!doctorId || !date || !from || !to)
      return res
        .status(400)
        .json({ message: "doctorId, date, from, to are required" });

    const doc = await ScheduleBlock.create({
      branchId,
      doctorId,
      date,
      from,
      to,
      reason,
      createdBy: String(req.user?.sub || ""),
    });
    res.status(201).json(doc);
  } catch (e) {
    next(e);
  }
}
