import express from "express";
import { createProjectController } from "../controllers/project.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { getMyProjectsController } from "../controllers/project.controller.js";
import { getProjectByIdController } from "../controllers/project.controller.js";
import { updateProjectController } from "../controllers/project.controller.js";
import { deleteProjectController } from "../controllers/project.controller.js";
import { updateProjectStatusController } from "../controllers/project.controller.js";
const router = express.Router();


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

  router.patch("/:projectId/status", updateProjectStatusController);

  


export default router;
