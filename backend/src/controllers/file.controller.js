import * as FileService from "../services/file.service.js";

export const requestUploadUrl = async (req, res, next) => {
    try {
        const { projectId, documentId, fileName, contentType, size } = req.body;

        console.log("FileController.requestUploadUrl called", {
            userId: req.user?.id,
            projectId,
            documentId,
            fileName,
            contentType,
            size,
        });

        // Ensure user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. Please log in.",
            });
        }

        const userId = req.user.id;

        if (!projectId || !fileName || !contentType || !size) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields.",
            });
        }

        const result = await FileService.requestUpload(
            projectId,
            documentId,
            userId,
            fileName,
            contentType,
            size
        );

        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error("Error in requestUploadUrl controller:", error);

        // Handle specialized errors from service
        if (error.status) {
            const status = error.status;
            if (status === 401) {
                return res.status(401).json({
                    success: false,
                    message: error.message || "Unauthorized",
                });
            }
            if (status === 403) {
                return res.status(403).json({
                    success: false,
                    message: error.message || "Forbidden",
                });
            }

            return res.status(status).json({
                success: false,
                message: error.message,
            });
        }

        return next(error);
    }
};

export const requestDownloadUrl = async (req, res, next) => {
    try {
        const { id: fileId } = req.params;
        const downloadUrl = await FileService.getFileDownloadUrl(fileId);

        res.status(200).json({ success: true, data: { downloadUrl } });
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({
                success: false,
                message: error.message
            });
        }
        next(error);
    }
};
