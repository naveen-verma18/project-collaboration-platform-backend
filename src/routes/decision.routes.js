import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  createDecision,
  getDecisions
} from "../controllers/decision.controller.js";

const router = express.Router();

router.post(
  "/projects/:projectId/decisions",
  authenticate,
  createDecision
);

router.get(
  "/projects/:projectId/decisions",
  authenticate,
  getDecisions
);

export default router;
