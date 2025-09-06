// ESM
import { Router } from "express";
import { requireAuth } from "#middlewares/requireAuth.js";
import { permit } from "#middlewares/rbac.js";
import { PERMS } from "#permissions";
import * as ctrl from "./notificationController.js";

const router = Router();
router.use(requireAuth);

const CAN = PERMS?.NOTIFICATIONS_READ || "notifications.read";

router.get("/", permit(CAN), ctrl.list);
router.patch("/:id/read", permit(CAN), ctrl.markRead);
router.post("/read-all", permit(CAN), ctrl.markAllRead);

// Optional SSE (you can keep or remove; header-auth only)
router.get("/stream", permit(CAN), ctrl.stream);

export default router;
