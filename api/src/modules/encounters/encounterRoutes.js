// api/src/modules/encounters/encounterRoutes.js
const router = require("express").Router({ mergeParams: true });
const { requireAuth } = require("../../middlewares/requireAuth");
const { hasPerm } = require("../../middlewares/rbac");
const validate = require("../../middlewares/validate");
const ctrl = require("./encounterController");
const { z } = require("zod");

// Very light Zod validators
const createSchema = {
  body: z.object({
    status: z.enum(["draft", "finalized"]).optional(),
    type: z.string().optional(),
    soap: z
      .object({
        subjective: z.string().optional(),
        objective: z.string().optional(),
        assessment: z.string().optional(),
        plan: z.string().optional(),
      })
      .optional(),
    vitals: z
      .object({
        temperature: z.string().optional(),
        bloodPressure: z.string().optional(),
        heartRate: z.string().optional(),
        respiratoryRate: z.string().optional(),
        oxygenSaturation: z.string().optional(),
        weight: z.string().optional(),
        height: z.string().optional(),
      })
      .optional(),
  }),
};

router.use(requireAuth);

// list
router.get("/", hasPerm("encounters:read"), ctrl.list);

// create
router.post(
  "/",
  hasPerm("encounters:create"),
  validate(createSchema),
  ctrl.create
);

// update
router.patch(
  "/:id",
  hasPerm("encounters:update"),
  validate(createSchema),
  ctrl.update
);

module.exports = router;
