import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  createDocument,
  getDocuments,
  updateDocumentController
} from "../controllers/document.controller.js";

const router = express.Router();

router.post(
  "/projects/:projectId/documents",
  authMiddleware,
  createDocument
);

router.get(
  "/projects/:projectId/documents",
  authMiddleware,
  getDocuments
);

router.put(
  "/documents/:documentId",
  authMiddleware,
  updateDocumentController
);

export default router;

