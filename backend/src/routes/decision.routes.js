import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  createDecision,
  getDecisions
} from "../controllers/decision.controller.js";

const router = express.Router();

router.post("/projects/:projectId/decisions", authMiddleware, createDecision);
router.get("/projects/:projectId/decisions", authMiddleware, getDecisions);

export default router;
