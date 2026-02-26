import { Editor } from "@tiptap/react";
// Import extensions to help with type merging if possible, though Tiptap usually does this globally
import "@tiptap/extension-underline";
import "@tiptap/extension-link";
import "@tiptap/extension-table";
import "@tiptap/extension-highlight";
import "@tiptap/extension-text-align";
import "@tiptap/extension-strike";
import "@tiptap/extension-code-block-lowlight";
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Code,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Link as LinkIcon,
    Undo,
    Redo,
    Table,
    Highlighter,
} from "lucide-react";

interface EditorToolbarProps {
    editor: Editor | null;
    role: "EDITOR" | "COMMENTER" | "VIEWER" | null;
}

export const EditorToolbar = ({ editor, role }: EditorToolbarProps) => {
    if (!editor || !editor.isActive) return null;

    const isEditable = role === "EDITOR";

    const addLink = () => {
        if (!editor || !editor.getAttributes) return;
        const previousUrl = editor.getAttributes("link")?.href;
        const url = window.prompt("URL", previousUrl);

        if (url === null) {
            return;
        }

        if (url === "") {
            (editor.chain().focus() as any).extendMarkRange("link").unsetLink().run();
            return;
        }

        (editor.chain().focus() as any).extendMarkRange("link").setLink({ href: url }).run();
    };

    const addTable = () => {
        if (!editor || !editor.chain) return;
        (editor.chain().focus() as any).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    };

    const ToolbarButton = ({
        onClick,
        isActive = false,
        disabled = false,
        children,
        title,
    }: {
        onClick: () => void;
        isActive?: boolean;
        disabled?: boolean;
        children: React.ReactNode;
        title: string;
    }) => (
        <button
            onClick={onClick}
            disabled={!isEditable || disabled}
            title={title}
            className={`p-2 rounded-md transition-colors ${isActive
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted text-foreground"
                } ${!isEditable || disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
            {children}
        </button>
    );

    // Helper for safe command checking
    const canUndo = () => {
        try {
            return (editor as any)?.can?.().undo?.() || false;
        } catch (e) {
            return false;
        }
    };

    const canRedo = () => {
        try {
            return (editor as any)?.can?.().redo?.() || false;
        } catch (e) {
            return false;
        }
    };

    const isActive = (name: string, attributes?: any) => {
        try {
            return editor.isActive(name, attributes);
        } catch (e) {
            return false;
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-1 p-1 bg-card border-b sticky top-0 z-10 w-full overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1 border-r pr-1 mr-1">
                <ToolbarButton
                    onClick={() => (editor.chain().focus() as any).undo().run()}
                    disabled={!canUndo()}
                    title="Undo"
                >
                    <Undo size={18} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => (editor.chain().focus() as any).redo().run()}
                    disabled={!canRedo()}
                    title="Redo"
                >
                    <Redo size={18} />
                </ToolbarButton>
            </div>

            <div className="flex items-center gap-1 border-r pr-1 mr-1">
                <ToolbarButton
                    onClick={() => (editor.chain().focus() as any).toggleBold().run()}
                    isActive={isActive("bold")}
                    title="Bold"
                >
                    <Bold size={18} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => (editor.chain().focus() as any).toggleItalic().run()}
                    isActive={isActive("italic")}
                    title="Italic"
                >
                    <Italic size={18} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => (editor.chain().focus() as any).toggleUnderline().run()}
                    isActive={isActive("underline")}
                    title="Underline"
                >
                    <UnderlineIcon size={18} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => (editor.chain().focus() as any).toggleStrike().run()}
                    isActive={isActive("strike")}
                    title="Strikethrough"
                >
                    <Strikethrough size={18} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => (editor.chain().focus() as any).toggleHighlight().run()}
                    isActive={isActive("highlight")}
                    title="Highlight"
                >
                    <Highlighter size={18} />
                </ToolbarButton>
            </div>

            <div className="flex items-center gap-1 border-r pr-1 mr-1">
                <ToolbarButton
                    onClick={() => (editor.chain().focus() as any).toggleHeading({ level: 1 }).run()}
                    isActive={isActive("heading", { level: 1 })}
                    title="Heading 1"
                >
                    <Heading1 size={18} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => (editor.chain().focus() as any).toggleHeading({ level: 2 }).run()}
                    isActive={isActive("heading", { level: 2 })}
                    title="Heading 2"
                >
                    <Heading2 size={18} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => (editor.chain().focus() as any).toggleHeading({ level: 3 }).run()}
                    isActive={isActive("heading", { level: 3 })}
                    title="Heading 3"
                >
                    <Heading3 size={18} />
                </ToolbarButton>
            </div>

            <div className="flex items-center gap-1 border-r pr-1 mr-1">
                <ToolbarButton
                    onClick={() => (editor.chain().focus() as any).toggleBulletList().run()}
                    isActive={isActive("bulletList")}
                    title="Bullet List"
                >
                    <List size={18} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => (editor.chain().focus() as any).toggleOrderedList().run()}
                    isActive={isActive("orderedList")}
                    title="Numbered List"
                >
                    <ListOrdered size={18} />
                </ToolbarButton>
            </div>

            <div className="flex items-center gap-1 border-r pr-1 mr-1">
                <ToolbarButton
                    onClick={() => (editor.chain().focus() as any).setTextAlign("left").run()}
                    isActive={isActive("textAlign" as any, { textAlign: "left" })}
                    title="Align Left"
                >
                    <AlignLeft size={18} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => (editor.chain().focus() as any).setTextAlign("center").run()}
                    isActive={isActive("textAlign" as any, { textAlign: "center" })}
                    title="Align Center"
                >
                    <AlignCenter size={18} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => (editor.chain().focus() as any).setTextAlign("right").run()}
                    isActive={isActive("textAlign" as any, { textAlign: "right" })}
                    title="Align Right"
                >
                    <AlignRight size={18} />
                </ToolbarButton>
            </div>

            <div className="flex items-center gap-1 border-r pr-1 mr-1">
                <ToolbarButton
                    onClick={() => (editor.chain().focus() as any).toggleBlockquote().run()}
                    isActive={isActive("blockquote")}
                    title="Blockquote"
                >
                    <Quote size={18} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => (editor.chain().focus() as any).toggleCodeBlock().run()}
                    isActive={isActive("codeBlock")}
                    title="Code Block"
                >
                    <Code size={18} />
                </ToolbarButton>
            </div>

            <div className="flex items-center gap-1">
                <ToolbarButton
                    onClick={addLink}
                    isActive={isActive("link")}
                    title="Insert Link"
                >
                    <LinkIcon size={18} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={addTable}
                    isActive={isActive("table")}
                    title="Insert Table"
                >
                    <Table size={18} />
                </ToolbarButton>
            </div>
        </div>
    );
};
