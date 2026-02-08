import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { createDecisionController,getDecisionsController} from "../controllers/decision.controller.js";

const router = express.Router();

// Create decision
router.post(
  "/projects/:projectId/decisions",
  authenticate,
  createDecisionController
);

// Get all decisions
router.get(
  "/projects/:projectId/decisions",
  authenticate,
  getDecisionsController
);

export default router;
