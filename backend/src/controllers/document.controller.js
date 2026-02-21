import * as documentService from "../services/document.service.js";

export const createDocument = async (req, res, next) => {
  const { projectId } = req.params;
  const { title, content, type } = req.body;

  try {
    const doc = await documentService.createDocument({
      projectId,
      userId: req.user.id,
      title,
      content,
      type,
    });

    res.status(201).json({
      success: true,
      data: doc,
    });
  } catch (error) {
    next(error);
  }
};

export const getDocuments = async (req, res, next) => {
  const { projectId } = req.params;

  try {
    const docs = await documentService.getProjectDocuments({
      projectId,
      userId: req.user.id,
    });

    res.json({
      success: true,
      data: docs,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDocumentController = async (req, res, next) => {
  const { documentId } = req.params;
  const { title, content } = req.body;

  try {
    const doc = await documentService.updateDocument({
      documentId,
      userId: req.user.id,
      title,
      content,
    });

    res.json({
      success: true,
      data: doc,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDocumentController = async (req, res, next) => {
  const { documentId } = req.params;

  try {
    await documentService.deleteDocument({
      documentId,
      userId: req.user.id,
    });

    res.status(204).json({
      success: true,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
