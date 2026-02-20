import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { GitBranch, Plus, MessageSquare, History, User } from "lucide-react";
import { Sidebar } from "../shared/Sidebar";
import { Navbar } from "../shared/Navbar";
import { decisions as decisionApi } from "../../api/services";
import { projects as projectApi } from "../../api/projects";
import { Project, Decision } from "../../api/types";

interface DecisionsPageProps {
    theme: "light" | "dark";
    toggleTheme: () => void;
}

export function DecisionsPage({ theme, toggleTheme }: DecisionsPageProps) {
    const [decisions, setDecisions] = useState<Decision[]>([]);
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

        const fetchDecisions = async () => {
            setLoading(true);
            try {
                const res = await decisionApi.getAll(selectedProjectId);
                setDecisions(res.data);
            } catch (error) {
                console.error("Failed to fetch decisions", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDecisions();
    }, [selectedProjectId]);

    return (
        <div className="flex min-h-screen bg-[#F6F7FB] dark:bg-[#0F172A]">
            <Sidebar />
            <div className="flex-1 flex flex-col ml-64">
                <Navbar theme={theme} toggleTheme={toggleTheme} />
                <main className="flex-1 p-8">
                    <div className="max-w-5xl mx-auto">
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                                    <GitBranch className="w-8 h-8 text-indigo-600" />
                                    Decisions
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Key project decisions and their rationale
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
                                    New Decision
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : decisions.length === 0 ? (
                            <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <GitBranch className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500 dark:text-gray-400">No decisions recorded for this project.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {decisions.map((decision) => (
                                    <div
                                        key={decision.id}
                                        className="bg-white dark:bg-[#1E293B] rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                                {decision.title}
                                            </h3>
                                            <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-full text-xs font-bold uppercase tracking-wider">
                                                Decided
                                            </span>
                                        </div>
                                        <div className="mb-6">
                                            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</h4>
                                            <p className="text-gray-700 dark:text-gray-300">
                                                {decision.description}
                                            </p>
                                        </div>
                                        {decision.reason && (
                                            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-l-4 border-indigo-500">
                                                <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                                                    <MessageSquare className="w-3 h-3" />
                                                    Rationale
                                                </h4>
                                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                                    {decision.reason}
                                                </p>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-400">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1.5">
                                                    <User className="w-4 h-4 text-gray-300" />
                                                    <span>By {decision.creator?.name || "System"}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <History className="w-4 h-4 text-gray-300" />
                                                    <span>{new Date(decision.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
