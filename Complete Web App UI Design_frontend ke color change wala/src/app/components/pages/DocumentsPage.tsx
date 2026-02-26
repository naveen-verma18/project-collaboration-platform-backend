import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { FileText, Plus, ExternalLink, Clock, FolderKanban } from "lucide-react";
import { Link } from "react-router";
import { Sidebar } from "../shared/Sidebar";
import { Navbar } from "../shared/Navbar";
import { documents as documentApi } from "../../api/services";
import { projects as projectApi } from "../../api/projects";
import { Project, Document } from "../../api/types";

interface DocumentsPageProps {
    theme: "light" | "dark";
    toggleTheme: () => void;
}

export function DocumentsPage({ theme, toggleTheme }: DocumentsPageProps) {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await projectApi.getAll();
                setProjects(res.data);
                if (res.data.length > 0) {
                    setSelectedProjectId(res.data[0].id);
                }
            } catch (error) {
                console.error("Failed to fetch projects", error);
            }
        };
        fetchProjects();
    }, []);

    useEffect(() => {
        if (!selectedProjectId) return;

        const fetchDocs = async () => {
            setLoading(true);
            try {
                const res = await documentApi.getAll(selectedProjectId);
                setDocuments(res.data);
            } catch (error) {
                console.error("Failed to fetch documents", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDocs();
    }, [selectedProjectId]);

    return (
        <div className="flex min-h-screen bg-[#F6F7FB] dark:bg-[#0F172A]">
            <Sidebar />
            <div className="flex-1 flex flex-col ml-64">
                <Navbar theme={theme} toggleTheme={toggleTheme} />
                <main className="flex-1 p-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                                    <FileText className="w-8 h-8 text-indigo-600" />
                                    Documents
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Project documentation and shared files
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <select
                                    value={selectedProjectId}
                                    onChange={(e) => setSelectedProjectId(e.target.value)}
                                    className="bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="" disabled>Select Project</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                                    <Plus className="w-4 h-4" />
                                    New Document
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : documents.length === 0 ? (
                            <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500 dark:text-gray-400">No documents found for this project.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {documents.map((doc) => (
                                    <Link
                                        key={doc.id}
                                        to={`/project/${selectedProjectId}/documents/${doc.id}/edit`}
                                        className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 flex flex-col"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                                                <FileText className="w-6 h-6 text-indigo-600 dark:text-purple-400" />
                                            </div>
                                            <button className="text-gray-400 hover:text-indigo-600">
                                                <ExternalLink className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
                                            {doc.title}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                                            {doc.content}
                                        </p>
                                        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-400">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(doc.updatedAt).toLocaleDateString()}
                                            </div>
                                            <span className="uppercase tracking-wider font-bold text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-500">
                                                {doc.type || "DOC"}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
