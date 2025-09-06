// ESM
import Notification from "./notificationModel.js";

/** Resolve branch like other modules (patients, etc.) */
function resolveBranchId(req, { allowUnscoped = false } = {}) {
  const roles = Array.isArray(req.user?.roles) ? req.user.roles : [];
  const isSuper = roles.includes("SUPER_ADMIN") || roles.includes("ADMIN");
  const header = req.get?.("x-branch-id") || req.header?.("X-Branch-Id");
  if (header) return String(header);
  if (allowUnscoped && isSuper) return null; // SUPER can see org-wide
  const ctx = req.ctx?.branchId;
  if (!ctx) {
    const err = new Error("Branch context required");
    err.status = 400;
    throw err;
  }
  return ctx;
}

const isOn = (v) =>
  ["1", "true", "yes"].includes(String(v ?? "").toLowerCase());

/** Build audience scope */
function buildAudienceFilter({ branchId, userId }) {
  const or = [{ audience: "ALL" }];
  if (branchId != null)
    or.push({ audience: "BRANCH", branchId: String(branchId) });
  if (userId) or.push({ audience: "USER", userIds: { $in: [String(userId)] } });
  return { $or: or };
}

/** GET /api/v1/notifications?unreadOnly=1&countOnly=1&page=1&limit=10 */
export async function list(req, res, next) {
  try {
    const branchId = resolveBranchId(req, { allowUnscoped: true });
    const userId = String(req.user?.sub || "");
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 10)));
    const unreadOnly = isOn(req.query.unreadOnly);
    const countOnly = isOn(req.query.countOnly);

    const base = buildAudienceFilter({ branchId, userId });
    const unread = unreadOnly
      ? { readBy: { $not: { $elemMatch: { userId } } } }
      : {};
    const filter = { ...base, ...unread };

    const total = await Notification.countDocuments(filter);
    if (countOnly) return res.json({ total });

    const items = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    for (const n of items) {
      const hit = (n.readBy || []).find((r) => r.userId === userId);
      n.readAt = hit?.at || null;
    }

    res.json({ total, page, limit, items });
  } catch (e) {
    next(e);
  }
}

/** PATCH /api/v1/notifications/:id/read (idempotent) */
export async function markRead(req, res, next) {
  try {
    const userId = String(req.user?.sub || "");
    const { id } = req.params;

    const r = await Notification.updateOne(
      { _id: id, "readBy.userId": { $ne: userId } },
      { $addToSet: { readBy: { userId, at: new Date() } } }
    );

    res.json({ ok: true, id, modified: r.modifiedCount || 0 });
  } catch (e) {
    next(e);
  }
}

/** POST /api/v1/notifications/read-all */
export async function markAllRead(req, res, next) {
  try {
    const branchId = resolveBranchId(req, { allowUnscoped: true });
    const userId = String(req.user?.sub || "");
    const base = buildAudienceFilter({ branchId, userId });

    const r = await Notification.updateMany(
      { ...base, "readBy.userId": { $ne: userId } },
      { $addToSet: { readBy: { userId, at: new Date() } } }
    );

    res.json({ ok: true, modified: r.modifiedCount || 0 });
  } catch (e) {
    next(e);
  }
}

/** Optional SSE for realtime bell (kept for future use; not required today) */
export async function stream(req, res, next) {
  try {
    res.set({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.flushHeaders?.();

    const branchId = resolveBranchId(req, { allowUnscoped: true });
    const userId = String(req.user?.sub || "");
    const base = buildAudienceFilter({ branchId, userId });
    const unreadFilter = {
      ...base,
      readBy: { $not: { $elemMatch: { userId } } },
    };
    const total = await Notification.countDocuments(unreadFilter);
    res.write(`event: init\ndata: ${JSON.stringify({ unread: total })}\n\n`);

    const hb = setInterval(() => res.write(`event: ping\ndata: {}\n\n`), 25000);
    req.on("close", () => clearInterval(hb));
  } catch (e) {
    next(e);
  }
}
