import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router";
import { motion } from "motion/react";
import {
  FileText,
  Plus,
  Save,
  Clock,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { documents as documentApi } from "../../api/services";

interface Document {
  id: string;
  title: string;
  content: string;
  projectId: string;
  type: string;
  version: number;
  updatedAt: string;
  // Backend doesn't return lastEdited/editedBy yet in flat response easily without relations
  // I will use mock/derived values
}

export function DocumentsTab() {
  const { projectId } = useParams();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [content, setContent] = useState("");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [showConflict, setShowConflict] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);

  // Debounce save
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (projectId) {
      fetchDocuments();
    }
  }, [projectId]);

  useEffect(() => {
    if (selectedDoc) {
      setContent(selectedDoc.content);
      setSaveStatus("saved");
    }
  }, [selectedDoc?.id]); // Only reset when switching doc

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await documentApi.getAll(projectId!);
      const backendDocs = response.data;
      const mappedDocs = backendDocs.map((d: any) => ({
        ...d,
        updatedAt: new Date(d.updatedAt).toLocaleTimeString(), // Mock time format
      }));
      setDocuments(mappedDocs);
      if (mappedDocs.length > 0 && !selectedDoc) {
        setSelectedDoc(mappedDocs[0]);
        setContent(mappedDocs[0].content);
      }
    } catch (error) {
      console.error("Failed to fetch documents", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async () => {
    try {
      const response = await documentApi.create(projectId!, {
        title: "New Document",
        content: "# New Document",
        type: "REQUIREMENTS", // Default type
      });
      await fetchDocuments();
      setSelectedDoc(response.data);
    } catch (error) {
      console.error("Failed to create document", error);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setSaveStatus("unsaved");
    setIsTyping(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      if (!selectedDoc) return;
      setSaveStatus("saving");
      try {
        await documentApi.update(selectedDoc.id, {
          title: selectedDoc.title,
          content: newContent,
        });
        setSaveStatus("saved");
        setIsTyping(false);
        // Update local list to reflect latest version if returned?
      } catch (error) {
        console.error("Failed to save", error);
        setSaveStatus("unsaved"); // or error state
      }
    }, 1000);
  };

  if (loading) return <div className="text-center py-10">Loading documents...</div>;

  return (
    <div className="space-y-6">
      {/* Conflict Banner - Mocked logic removed/kept simple */}
      {showConflict && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-2xl p-4"
        >
          {/* ... Conflict UI ... */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-yellow-700">Conflict detected (Mock)</span>
            </div>
            <button onClick={() => setShowConflict(false)}>Dismiss</button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Document List Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateDocument}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                New Document
              </motion.button>
            </div>

            <div className="p-2 space-y-1 max-h-[600px] overflow-y-auto">
              {documents.map((doc) => (
                <motion.button
                  key={doc.id}
                  whileHover={{ x: 4 }}
                  onClick={() => setSelectedDoc(doc)}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${selectedDoc?.id === doc.id
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <FileText
                      className={`w-5 h-5 mt-0.5 flex-shrink-0 ${selectedDoc?.id === doc.id
                          ? "text-white"
                          : "text-gray-400"
                        }`}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate mb-1">{doc.title}</h3>
                      <p
                        className={`text-xs ${selectedDoc?.id === doc.id
                            ? "text-white/80"
                            : "text-gray-500 dark:text-gray-400"
                          }`}
                      >
                        v{doc.version} • {doc.updatedAt}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Editor Panel */}
        <div className="lg:col-span-3">
          {selectedDoc ? (
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Editor Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedDoc.title}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Version {selectedDoc.version}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Save Status */}
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      {saveStatus === "saving" ? (
                        <>
                          <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Saving...
                          </span>
                        </>
                      ) : saveStatus === "saved" ? (
                        <>
                          <Save className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <span className="text-sm text-green-600 dark:text-green-400">
                            Saved
                          </span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Unsaved
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Editor Content */}
              <div className="p-6">
                <textarea
                  value={content}
                  onChange={handleContentChange}
                  className="w-full min-h-[500px] bg-transparent border-0 focus:outline-none text-gray-900 dark:text-white resize-none font-mono text-sm leading-relaxed"
                  placeholder="Start writing..."
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a document or create a new one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
