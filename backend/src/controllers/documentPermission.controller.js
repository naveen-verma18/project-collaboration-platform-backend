import * as DocumentPermissionService from "../services/documentPermission.service.js";

export const getDocumentRole = async (req, res, next) => {
    try {
        const { id: documentId } = req.params;
        const userId = req.user.id; // from auth middleware

        const role = await DocumentPermissionService.getDocumentRole(documentId, userId);

        res.status(200).json({ success: true, data: { role } });
    } catch (error) {
        next(error);
    }
};

export const getDocumentPermissions = async (req, res, next) => {
    try {
        const { id: documentId } = req.params;
        const permissions = await DocumentPermissionService.getAllDocumentPermissions(documentId);

        res.status(200).json({ success: true, data: permissions });
    } catch (error) {
        next(error);
    }
};

export const setDocumentRole = async (req, res, next) => {
    try {
        const { id: documentId, userId } = req.params;
        const { role } = req.body;

        const permission = await DocumentPermissionService.setDocumentPermission(documentId, userId, role);

        res.status(200).json({ success: true, data: permission });
    } catch (error) {
        next(error);
    }
};
