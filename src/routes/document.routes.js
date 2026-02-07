import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  createDocument,
  getDocuments,
  updateDocument
} from "../controllers/document.controller.js";

const router = express.Router();

router.post(
  "/projects/:projectId/documents",
  authenticate,
  createDocument
);

router.get(
  "/projects/:projectId/documents",
  authenticate,
  getDocuments
);

router.put(
  "/documents/:documentId",
  authenticate,
  updateDocument
);

export default router;
