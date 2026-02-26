import { useState } from "react";
import { useParams } from "react-router";

import { CollaborativeEditor } from "../components/editor/CollaborativeEditor";
import { VersionHistoryPanel } from "../components/editor/VersionHistoryPanel";
import { PermissionPanel } from "../components/editor/PermissionPanel";
import { FileUploadButton } from "../components/editor/FileUploadButton";
import { useAuth } from "../context/AuthContext";

export default function EditorPage() {
    const { projectId, documentId } = useParams();
    const { user } = useAuth();
    const [isVersionPanelOpen, setIsVersionPanelOpen] = useState(false);
    const [editorRole, setEditorRole] = useState<"EDITOR" | "COMMENTER" | "VIEWER" | null>(null);

    console.log("EditorPage Mounted", { projectId, documentId, userId: user?.id });

    if (!projectId || !documentId || !user) {
        return <div className="p-8">Loading or invalid route...</div>;
    }

    const cursorColor = "#" + Math.floor(Math.random() * 16777215).toString(16);

    const handleUploadComplete = (url: string, fileName: string) => {
        alert(`File uploaded: ${fileName}. URL available in console.`);
        console.log("File URL:", url);
    };

    const handleRestore = (versionId: number) => {
        console.log(`Document restored to version ${versionId}`);
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] p-4 gap-4">
            <div className="flex-1 flex flex-col gap-2 relative">
                <div className="flex justify-between items-center bg-card p-2 rounded-lg border shadow-sm">
                    <h2 className="text-xl font-bold">Document Editor</h2>
                    <div className="flex items-center gap-2">
                        <FileUploadButton
                            projectId={projectId}
                            documentId={documentId}
                            onUploadComplete={handleUploadComplete}
                            disabled={editorRole !== "EDITOR"}
                        />
                        <button
                            onClick={() => setIsVersionPanelOpen(!isVersionPanelOpen)}
                            className="px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                        >
                            History
                        </button>
                    </div>
                </div>

                <div className="flex-1 bg-card rounded-lg shadow-sm border overflow-hidden">
                    <CollaborativeEditor
                        projectId={projectId}
                        documentId={documentId}
                        userId={user.id}
                        userName={user.email || "Anonymous"}
                        color={cursorColor}
                        onRoleChange={setEditorRole}
                    />
                </div>
            </div>

            <div className="w-80 flex flex-col gap-4 overflow-y-auto">
                {isVersionPanelOpen && (
                    <div className="bg-card border rounded-lg shadow-sm overflow-hidden flex-shrink-0" style={{ maxHeight: "300px" }}>
                        <VersionHistoryPanel
                            documentId={documentId}
                            isOpen={isVersionPanelOpen}
                            onClose={() => setIsVersionPanelOpen(false)}
                            onRestore={handleRestore}
                        />
                    </div>
                )}

                <div className="bg-card border rounded-lg shadow-sm">
                    <PermissionPanel
                        projectId={projectId}
                        documentId={documentId}
                    />
                </div>
            </div>
        </div>
    );
}
