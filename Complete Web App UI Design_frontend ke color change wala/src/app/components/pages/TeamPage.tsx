import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Users, Mail, UserPlus, Shield, Star, MoreVertical } from "lucide-react";
import { Sidebar } from "../shared/Sidebar";
import { Navbar } from "../shared/Navbar";
import { members as projectMemberApi } from "../../api/services";
import { projects as projectApi } from "../../api/projects";
import { Project, ProjectMember } from "../../api/types";

interface TeamPageProps {
    theme: "light" | "dark";
    toggleTheme: () => void;
}

export function TeamPage({ theme, toggleTheme }: TeamPageProps) {
    const [members, setMembers] = useState<ProjectMember[]>([]);
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

        const fetchMembers = async () => {
            setLoading(true);
            try {
                const res = await projectMemberApi.getAll(selectedProjectId);
                setMembers(res.data);
            } catch (error) {
                console.error("Failed to fetch members", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMembers();
    }, [selectedProjectId]);

    const handleRoleChange = async (memberId: string, newRole: string) => {
        try {
            await projectMemberApi.changeRole(selectedProjectId, memberId, newRole);
            setMembers((prev) =>
                prev.map((m) => (m.id === memberId ? { ...m, role: newRole as any } : m))
            );
        } catch (error) {
            console.error("Failed to change role", error);
            alert("Failed to change role. Only OWNERs can promote/demote.");
        }
    };

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
                                    <Users className="w-8 h-8 text-indigo-600" />
                                    Team Members
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Manage your project collaborators and their roles
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
                                    <UserPlus className="w-4 h-4" />
                                    Invite Member
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : members.length === 0 ? (
                            <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Users className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500 dark:text-gray-400">No members found in this project.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {members.map((member) => (
                                    <div
                                        key={member.id}
                                        className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl">
                                                    {member.user?.name?.charAt(0) || "U"}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                                                        {member.user?.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                                                        <Mail className="w-3.5 h-3.5" />
                                                        {member.user?.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <select
                                                    value={member.role}
                                                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                                    className="text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-1 outline-none focus:ring-1 focus:ring-indigo-500"
                                                >
                                                    <option value="MEMBER">Member</option>
                                                    <option value="ADMIN">Admin</option>
                                                    <option value="OWNER">Owner</option>
                                                </select>
                                                <button className="text-gray-400 hover:text-red-500 p-1 transition-colors" title="Remove Member">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 mt-4">
                                            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold flex items-center gap-1.5 capitalize">
                                                <Shield className="w-3.5 h-3.5" />
                                                {member.role?.toLowerCase()}
                                            </span>
                                            {(member.role === "OWNER" || member.role === "ADMIN") && (
                                                <span className="text-amber-500 flex items-center gap-1 text-xs font-bold">
                                                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                                                    {member.role === "OWNER" ? "Owner" : "Admin"}
                                                </span>
                                            )}
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
