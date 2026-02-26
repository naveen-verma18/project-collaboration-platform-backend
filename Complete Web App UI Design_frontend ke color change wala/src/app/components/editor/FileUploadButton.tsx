import { useState, useRef } from "react";
import { Upload, Paperclip } from "lucide-react";
import { fileApi } from "../../api/file.api";

interface FileUploadButtonProps {
    projectId: string;
    documentId?: string;
    onUploadComplete: (url: string, fileName: string) => void;
    disabled?: boolean;
}

export const FileUploadButton = ({ projectId, documentId, onUploadComplete, disabled }: FileUploadButtonProps) => {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        try {
            const res = await fileApi.requestUploadUrl({
                projectId,
                documentId,
                fileName: file.name,
                contentType: file.type,
                size: file.size,
            });

            const { uploadUrl, key } = res.data;

            await fetch(uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file,
            });

            const downloadRes = await fileApi.requestDownloadUrl(key);
            const { downloadUrl } = downloadRes.data;

            onUploadComplete(downloadUrl, file.name);
        } catch (error: any) {
            console.error("Upload failed", error);
            const message =
                error?.message ||
                error?.error?.message ||
                "Failed to upload file. Please check your permissions or try again.";
            alert(message);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <>
            <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={disabled || isUploading}
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading}
                className="p-2 hover:bg-muted rounded-md transition-colors disabled:opacity-50 flex items-center gap-1"
                title={disabled ? "Only editors can upload files" : "Upload File"}
            >
                {isUploading ? <Upload size={16} className="animate-bounce" /> : <Paperclip size={16} />}
                <span className="text-sm hidden sm:inline">Attach</span>
            </button>
        </>
    );
};
