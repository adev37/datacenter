// ESM
import { Router } from "express";
import { requireAuth } from "#middlewares/requireAuth.js";
import { permit } from "#middlewares/rbac.js";
import Notification from "./notificationModel.js";
import { PERMS } from "#permissions";

const r = Router();

r.use(requireAuth);

/**
 * GET /api/v1/notifications?unreadOnly=true&limit=20
 * Returns newest first; enforces branch visibility for BRANCH-scoped users.
 */
r.get("/", permit(PERMS.NOTIFICATIONS_READ), async (req, res, next) => {
  try {
    const { unreadOnly, limit = 20 } = req.query;
    const me = String(req.user.sub || "");
    const roles = req.user?.roles || [];
    const isSuper = roles.includes("SUPER_ADMIN");

    const branchId = req.ctx?.branchId || null;

    const $or = [
      // visible to my branch
      ...(isSuper ? [] : [{ audience: "BRANCH", branchId }]),
      // directly addressed to me
      { audience: "USER", userIds: me },
    ];

    const q = { $or };
    if (String(unreadOnly) === "true") q.readBy = { $ne: me };

    const items = await Notification.find(q)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    // mark which are read for this user
    const withRead = items.map((n) => ({
      ...n,
      read: (n.readBy || []).includes(me),
    }));
    res.json(withRead);
  } catch (e) {
    next(e);
  }
});

/** PATCH /api/v1/notifications/:id/read → marks current user as read */
r.patch(
  "/:id/read",
  permit(PERMS.NOTIFICATIONS_READ),
  async (req, res, next) => {
    try {
      const me = String(req.user.sub || "");
      const n = await Notification.findByIdAndUpdate(
        req.params.id,
        { $addToSet: { readBy: me } },
        { new: true }
      ).lean();
      if (!n)
        return res.status(404).json({ message: "Notification not found" });
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  }
);

export default r;
