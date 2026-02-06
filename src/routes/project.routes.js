import express from "express";
import { createProjectController } from "../controllers/project.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { getMyProjectsController } from "../controllers/project.controller.js";
import { getProjectByIdController } from "../controllers/project.controller.js";
const router = express.Router();
import { updateProjectController } from "../controllers/project.controller.js";
import { deleteProjectController } from "../controllers/project.controller.js";


router.get("/", authMiddleware, getMyProjectsController);
router.post("/", authMiddleware, createProjectController);
router.get("/:projectId", authMiddleware, getProjectByIdController);

router.put(
  "/projects/:projectId",
  authMiddleware,
  updateProjectController
);

router.delete(
    "/projects/:projectId",
    authMiddleware,
    deleteProjectController
  );
  


export default router;
