import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
    createGoal,
    getGoals,
    completeGoalController
} from "../controllers/goal.controller.js";

const router = express.Router();

router.post("/projects/:projectId/goals", authMiddleware, createGoal);
router.get("/projects/:projectId/goals", authMiddleware, getGoals);
router.patch("/goals/:goalId/complete", authMiddleware, completeGoalController);

export default router;
