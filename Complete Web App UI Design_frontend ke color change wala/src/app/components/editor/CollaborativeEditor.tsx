import { useState, useEffect } from "react";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";

import { initYDoc } from "../../../lib/yjsClient";
import { EditorToolbar } from "./EditorToolbar";

const lowlight = createLowlight(common);

interface CollaborativeEditorProps {
    projectId: string;
    documentId: string;
    userId: string;
    userName: string;
    color: string;
    onRoleChange?: (role: "EDITOR" | "COMMENTER" | "VIEWER") => void;
}

export const CollaborativeEditor = ({
    projectId,
    documentId,
    userId,
    userName,
    color,
    onRoleChange,
}: CollaborativeEditorProps) => {
    const [role, setRole] = useState<"EDITOR" | "COMMENTER" | "VIEWER" | null>(null);
    const [ydoc, setYdoc] = useState<any>(null);
    const [awareness, setAwareness] = useState<any>(null);
    const [collaborators, setCollaborators] = useState<any[]>([]);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);

    useEffect(() => {
        const { doc, awareness: aw, connect, disconnect } = initYDoc(projectId, documentId, userId);
        setYdoc(doc);
        setAwareness(aw);

        connect((assignedRole) => {
            setRole(assignedRole);
            onRoleChange?.(assignedRole);
        });

        const handleAwarenessUpdate = () => {
            const states = Array.from(aw.getStates().values());
            const users = states
                .filter((s: any) => s.user)
                .map((s: any) => ({
                    name: s.user.name,
                    color: s.user.color,
                    isTyping: s.isTyping,
                }));

            // Deduplicate by name for clean UI
            const uniqueUsers = Array.from(new Map(users.map(u => [u.name, u])).values());
            setCollaborators(uniqueUsers);

            const typing = uniqueUsers
                .filter(u => u.isTyping && u.name !== userName)
                .map(u => u.name);
            setTypingUsers(typing);
        };

        aw.on("update", handleAwarenessUpdate);

        return () => {
            aw.off("update", handleAwarenessUpdate);
            disconnect();
        };
    }, [projectId, documentId, userId, userName, onRoleChange]);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                history: false, // Collaboration handles history
                codeBlock: false, // We use CodeBlockLowlight
            }),
            Underline,
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-primary underline cursor-pointer",
                },
            }),
            Placeholder.configure({
                placeholder: "Start typing your document...",
            }),
            Highlight,
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            CodeBlockLowlight.configure({
                lowlight,
            }),
            ...(ydoc ? [
                Collaboration.configure({
                    document: ydoc,
                }),
                CollaborationCursor.configure({
                    provider: {
                        awareness: awareness,
                    },
                    user: { name: userName, color },
                }),
            ] : []),
        ],
        content: "",
        onUpdate: ({ transaction }) => {
            if (awareness && transaction.docChanged) {
                awareness.setLocalStateField("isTyping", true);

                // Clear typing status after 2 seconds of inactivity
                const timeoutId = (window as any).typingTimeout;
                if (timeoutId) clearTimeout(timeoutId);

                (window as any).typingTimeout = setTimeout(() => {
                    if (awareness) {
                        awareness.setLocalStateField("isTyping", false);
                    }
                }, 2000);
            }
        },
    }, [ydoc, role, awareness]);

    if (!ydoc || !editor) {
        return (
            <div className="flex items-center justify-center h-full bg-background animate-pulse">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground font-medium">Connecting to document...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background relative border rounded-lg overflow-hidden shadow-sm">
            <EditorToolbar editor={editor} role={role} />

            {editor && (
                <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
                    <div className="flex items-center gap-1 p-1 bg-popover border rounded-lg shadow-lg">
                        <button
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            className={`p-1.5 rounded hover:bg-accent ${editor.isActive("bold") ? "text-primary" : ""}`}
                        >
                            <span className="font-bold">B</span>
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            className={`p-1.5 rounded hover:bg-accent ${editor.isActive("italic") ? "text-primary" : ""}`}
                        >
                            <span className="italic">I</span>
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                            className={`p-1.5 rounded hover:bg-accent ${editor.isActive("underline") ? "text-primary" : ""}`}
                        >
                            <span className="underline">U</span>
                        </button>
                    </div>
                </BubbleMenu>
            )}

            <div className="flex-1 overflow-y-auto bg-card/50">
                <div className="max-w-4xl mx-auto min-h-full p-8 md:p-12 shadow-sm bg-card border-x ring-1 ring-border/50">
                    <EditorContent
                        editor={editor}
                        className="prose prose-sm md:prose-base dark:prose-invert max-w-none min-h-[500px] outline-none"
                    />
                </div>
            </div>

            <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/30 backdrop-blur-sm text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 border-r pr-3 mr-1">
                        <div className={`w-2 h-2 rounded-full ${role ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        <span>Role: <span className="font-semibold text-primary uppercase">{role || "Connecting"}</span></span>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                            {collaborators.map((u, i) => (
                                <div
                                    key={i}
                                    title={u.name}
                                    className="w-6 h-6 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                                    style={{ backgroundColor: u.color }}
                                >
                                    {u.name.charAt(0).toUpperCase()}
                                </div>
                            ))}
                        </div>
                        {typingUsers.length > 0 && (
                            <span className="italic animate-pulse">
                                {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="opacity-50">Document ID:</span>
                    <span className="font-mono">{documentId.slice(0, 8)}</span>
                </div>
            </div>
        </div>
    );
};
