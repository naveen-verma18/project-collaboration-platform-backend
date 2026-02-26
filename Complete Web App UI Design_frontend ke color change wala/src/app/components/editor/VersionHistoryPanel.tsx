import { useState, useEffect } from "react";
import { Clock, RotateCcw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Placeholder import for Version API
import { versionApi } from "../../api/version.api";

interface VersionHistoryPanelProps {
    documentId: string;
    onRestore: (versionId: number) => void;
    isOpen: boolean;
    onClose: () => void;
}

export const VersionHistoryPanel = ({
    documentId,
    onRestore,
    isOpen,
    onClose,
}: VersionHistoryPanelProps) => {
    const [versions, setVersions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadVersions();
        }
    }, [isOpen, documentId]);

    const loadVersions = async () => {
        setIsLoading(true);
        try {
            const res = await versionApi.getVersions(documentId);
            setVersions(res.data);
        } catch (error) {
            console.error("Failed to load versions:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRestore = async (version: number) => {
        if (window.confirm(`Are you sure you want to restore to version ${version}?`)) {
            try {
                await versionApi.restoreVersion(documentId, version);
                onRestore(version);
                onClose();
            } catch (error) {
                console.error("Failed to restore:", error);
                alert("Failed to restore version.");
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="w-80 border-l bg-background h-full flex flex-col shadow-lg p-4 z-10">
            <div className="flex items-center justify-between mb-4 pb-2 border-b">
                <h3 className="font-semibold flex items-center gap-2">
                    <Clock size={16} /> Version History
                </h3>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                    &times;
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
                {isLoading ? (
                    <div className="text-center text-sm text-muted-foreground">Loading versions...</div>
                ) : versions.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground">No versions found.</div>
                ) : (
                    versions.map((v) => (
                        <div key={v.id} className="p-3 border rounded-lg bg-card text-card-foreground text-sm flex flex-col gap-2 relative group hover:border-primary transition-colors">
                            <div className="flex justify-between items-start">
                                <span className="font-medium">Version {v.version}</span>
                                <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(v.createdAt), { addSuffix: true })}
                                </span>
                            </div>

                            <button
                                onClick={() => handleRestore(v.version)}
                                className="opacity-0 group-hover:opacity-100 absolute top-1/2 -translate-y-1/2 right-2 bg-primary text-primary-foreground p-1.5 rounded translate-x-2 group-hover:translate-x-0 transition-all flex items-center gap-1"
                                title="Restore this version"
                            >
                                <RotateCcw size={14} /> Restore
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
