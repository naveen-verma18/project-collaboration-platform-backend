import * as documentService from "../services/document.service.js";

export const createDocument = async (req, res) => {
  const { projectId } = req.params;
  const { title, content, type } = req.body;

  const doc = await documentService.createDocument({
    projectId,
    userId: req.user.id,
    title,
    content,
    type
  });

  res.status(201).json(doc);
};

export const getDocuments = async (req, res) => {
  const { projectId } = req.params;

  const docs = await documentService.getProjectDocuments({
    projectId,
    userId: req.user.id
  });

  res.json(docs);
};

export const updateDocument = async (req, res) => {
  const { documentId } = req.params;
  const { title, content } = req.body;

  const doc = await documentService.updateDocument({
    documentId,
    userId: req.user.id,
    title,
    content
  });

  res.json(doc);
};
