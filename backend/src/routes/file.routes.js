import express from "express";
import { requestUploadUrl, requestDownloadUrl } from "../controllers/file.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/files/upload-url", authMiddleware, requestUploadUrl);
router.get("/files/:id/download-url", authMiddleware, requestDownloadUrl);

export default router;
