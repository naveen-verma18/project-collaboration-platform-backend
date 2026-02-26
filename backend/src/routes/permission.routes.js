import express from "express";
import { getDocumentRole, getDocumentPermissions, setDocumentRole } from "../controllers/documentPermission.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/documents/:id/role", authMiddleware, getDocumentRole);
router.get("/documents/:id/permissions", authMiddleware, getDocumentPermissions);
router.put("/documents/:id/permissions/:userId", authMiddleware, setDocumentRole);

export default router;
