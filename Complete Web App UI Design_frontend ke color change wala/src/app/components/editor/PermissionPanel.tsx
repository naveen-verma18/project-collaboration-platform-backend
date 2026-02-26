import { useState, useEffect } from "react";
import { Shield } from "lucide-react";
import { permissionApi } from "../../api/permission.api";

interface PermissionPanelProps {
    documentId: string;
    projectId: string;
}

export const PermissionPanel = ({ documentId, projectId }: PermissionPanelProps) => {
    const [permissions, setPermissions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Note: Only project owners or full EDITORS usually see this. 
    // Should ideally check current user role before rendering.
    useEffect(() => {
        loadPermissions();
    }, [documentId]);

    const loadPermissions = async () => {
        try {
            setIsLoading(true);
            const res = await permissionApi.getPermissions(documentId);
            setPermissions(res.data);
        } catch (error) {
            console.error("Failed to load permissions:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRoleChange = async (userId: string, currentRole: string, newRole: string) => {
        if (currentRole === newRole) return;

        try {
            await permissionApi.setRole(documentId, userId, newRole);
            setPermissions(prev => prev.map(p =>
                p.user.id === userId ? { ...p, role: newRole } : p
            ));
        } catch (error) {
            console.error("Failed to change role:", error);
            alert("Failed to change permission.");
        }
    };

    return (
        <div className="mt-6 border rounded-lg p-4 bg-muted/20">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                <Shield size={18} /> Document Permissions
            </h3>

            {isLoading ? (
                <div className="text-sm text-muted-foreground animate-pulse">Loading permissions...</div>
            ) : permissions.length === 0 ? (
                <div className="text-sm text-muted-foreground">Using default project member permissions (Viewer).</div>
            ) : (
                <div className="space-y-3">
                    {permissions.map((p) => (
                        <div key={p.id} className="flex items-center justify-between p-2 bg-background border rounded-md">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">{p.user.name || "Unknown User"}</span>
                                <span className="text-xs text-muted-foreground">{p.user.email}</span>
                            </div>

                            <select
                                value={p.role}
                                onChange={(e) => handleRoleChange(p.user.id, p.role, e.target.value)}
                                className="text-sm bg-background border border-input rounded p-1 outline-none focus:ring-1 focus:ring-ring"
                            >
                                <option value="VIEWER">Viewer</option>
                                <option value="COMMENTER">Commenter</option>
                                <option value="EDITOR">Editor</option>
                            </select>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
