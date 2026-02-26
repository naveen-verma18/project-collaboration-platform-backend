import express from "express";
import { getDocumentVersions, restoreDocumentVersion } from "../controllers/version.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/documents/:id/versions", authMiddleware, getDocumentVersions);
router.post("/documents/:id/restore/:version", authMiddleware, restoreDocumentVersion);

export default router;
