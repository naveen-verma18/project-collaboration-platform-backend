import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Target, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { Sidebar } from "../shared/Sidebar";
import { Navbar } from "../shared/Navbar";
import { goals as goalApi } from "../../api/services";
import { projects as projectApi } from "../../api/projects";
import { Project, Goal } from "../../api/types";

interface GoalsPageProps {
    theme: "light" | "dark";
    toggleTheme: () => void;
}

export function GoalsPage({ theme, toggleTheme }: GoalsPageProps) {
    const [goals, setGoals] = useState<Goal[]>([]);
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

        const fetchGoals = async () => {
            setLoading(true);
            try {
                const res = await goalApi.getAll(selectedProjectId);
                setGoals(res.data);
            } catch (error) {
                console.error("Failed to fetch goals", error);
            } finally {
                setLoading(false);
            }
        };
        fetchGoals();
    }, [selectedProjectId]);

    const handleComplete = async (goalId: string) => {
        try {
            await goalApi.complete(goalId);
            setGoals(goals.map(g => g.id === goalId ? { ...g, status: "COMPLETED" } : g));
        } catch (error) {
            console.error("Failed to complete goal", error);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#F6F7FB] dark:bg-[#0F172A]">
            <Sidebar />
            <div className="flex-1 flex flex-col ml-64">
                <Navbar theme={theme} toggleTheme={toggleTheme} />
                <main className="flex-1 p-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                                    <Target className="w-8 h-8 text-indigo-600" />
                                    Goals
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Track and manage project deliverables
                                </p>
                            </div>

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
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : goals.length === 0 ? (
                            <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Target className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500 dark:text-gray-400">No goals found for this project.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {goals.map((goal) => (
                                    <div
                                        key={goal.id}
                                        className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-200 dark:border-gray-700 flex items-center justify-between group hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => goal.status !== "COMPLETED" && handleComplete(goal.id)}
                                                className={`transition-colors ${goal.status === "COMPLETED" ? "text-green-500" : "text-gray-400 hover:text-indigo-600"}`}
                                            >
                                                {goal.status === "COMPLETED" ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                                            </button>
                                            <div>
                                                <h3 className={`font-semibold text-lg ${goal.status === "COMPLETED" ? "text-gray-400 line-through" : "text-gray-900 dark:text-white"}`}>
                                                    {goal.title}
                                                </h3>
                                                {goal.description && (
                                                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{goal.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${goal.status === "COMPLETED"
                                                ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                                : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400"
                                                }`}>
                                                {goal.status}
                                            </span>
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
