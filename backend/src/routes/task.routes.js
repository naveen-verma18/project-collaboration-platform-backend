import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
    createTask,
    getTasks,
    updateTask,
    deleteTask
} from "../controllers/task.controller.js";

const router = express.Router();

router.post("/projects/:projectId/tasks", authMiddleware, createTask);
router.get("/projects/:projectId/tasks", authMiddleware, getTasks);
router.put("/tasks/:taskId", authMiddleware, updateTask);
router.delete("/tasks/:taskId", authMiddleware, deleteTask);

export default router;
