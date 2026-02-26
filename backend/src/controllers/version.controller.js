import * as VersionService from "../services/version.service.js";

export const getDocumentVersions = async (req, res, next) => {
    try {
        const { id: documentId } = req.params;
        const versions = await VersionService.getDocumentVersions(documentId);
        res.status(200).json({ success: true, data: versions });
    } catch (error) {
        next(error);
    }
};

export const restoreDocumentVersion = async (req, res, next) => {
    try {
        const { id: documentId, version } = req.params;

        if (!documentId || !version) {
            return res.status(400).json({ success: false, message: "Document ID and Version required" });
        }

        const result = await VersionService.restoreDocumentVersion(
            documentId,
            parseInt(version, 10)
        );

        res.status(200).json({
            success: true,
            data: result,
            message: "Document restored successfully"
        });
    } catch (error) {
        next(error);
    }
};
