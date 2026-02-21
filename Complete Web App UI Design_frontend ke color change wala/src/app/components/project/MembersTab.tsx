import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Crown,
  Shield,
  User as UserIcon,
  UserPlus,
  Mail,
  X,
  Loader2
} from "lucide-react";
import { useParams } from "react-router";
import { members as memberApi } from "../../api/services";

interface Member {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  avatar: string;
  color: string;
  joinedAt: string;
  status: "online" | "away" | "offline";
}

export function MembersTab() {
  const { projectId } = useParams();
  const [members, setMembers] = useState<Member[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMembers = async () => {
    if (!projectId) return;
    try {
      setIsLoading(true);
      const response = await memberApi.getAll(projectId);
      const data = response.data;
      const formattedMembers = data.map((m: any) => ({
        id: m.id, // User ID or Member ID? Backend returns member list, we should check structure.
        // Wait, my backend implementation returns [ownerMember, ...formattedMembers]
        // each has id=userId (for owner) or id=userId (for members) 
        // Actually for members I returned id: m.userId.
        // So 'id' is userId.
        name: m.name,
        email: m.email,
        role: m.role,
        avatar: m.avatar,
        color: "from-indigo-500 to-purple-500", // Mock color
        joinedAt: new Date(m.joinedAt).toLocaleDateString(),
        status: "online" // Mock status
      }));
      setMembers(formattedMembers);
    } catch (err: any) {
      console.error("Failed to fetch members", err);
      setError("Failed to load members");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  const updateRole = async (memberId: string, newRole: "OWNER" | "ADMIN" | "MEMBER") => {
    if (!projectId) return;
    try {
      await memberApi.changeRole(projectId, memberId, newRole);
      // Optimistic update
      setMembers(
        members.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );
      setShowRoleMenu(null);
    } catch (err) {
      console.error("Failed to change role", err);
      alert("Failed to change role");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!projectId) return;
    if (!confirm("Are you sure you want to remove this member?")) return;
    try {
      await memberApi.remove(projectId, memberId);
      setMembers(members.filter(m => m.id !== memberId));
    } catch (err) {
      console.error("Failed to remove member", err);
      alert("Failed to remove member");
    }
  }

  const roleConfig = {
    OWNER: {
      icon: Crown,
      color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700",
      label: "Owner",
    },
    ADMIN: {
      icon: Shield,
      color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-700",
      label: "Admin",
    },
    MEMBER: {
      icon: UserIcon,
      color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700",
      label: "Member",
    },
  };

  const statusConfig = {
    online: { color: "bg-green-500", label: "Online" },
    away: { color: "bg-yellow-500", label: "Away" },
    offline: { color: "bg-gray-400", label: "Offline" },
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Team Members
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage team members and their roles
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Invite Member
        </motion.button>
      </div>

      {/* Error */}
      {error && <div className="text-red-500 bg-red-50 p-3 rounded-lg">{error}</div>}


      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Members
            </h3>
            <UserIcon className="w-5 h-5 text-indigo-600 dark:text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {members.length}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Online Now
            </h3>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {members.filter((m) => m.status === "online").length}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Admins
            </h3>
            <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {members.filter((m) => m.role === "ADMIN").length}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Members
            </h3>
            <UserIcon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {members.filter((m) => m.role === "MEMBER").length}
          </p>
        </motion.div>
      </div>

      {/* Members List */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {members.map((member, index) => {
            const RoleIcon = roleConfig[member.role].icon;
            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${member.role === "OWNER" ? "bg-yellow-50/30 dark:bg-yellow-900/5" : ""
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative">
                      <div
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${member.color} flex items-center justify-center text-white font-medium text-lg`}
                      >
                        {member.avatar}
                      </div>
                      <div
                        className={`absolute bottom-0 right-0 w-4 h-4 ${statusConfig[member.status].color} rounded-full border-2 border-white dark:border-[#1E293B]`}
                        title={statusConfig[member.status].label}
                      />
                    </div>

                    {/* Info */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {member.name}
                        </h3>
                        {member.role === "OWNER" && (
                          <Crown className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {member.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Joined {member.joinedAt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Role Badge */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowRoleMenu(showRoleMenu === member.id ? null : member.id)
                        }
                        disabled={member.role === "OWNER"}
                        className={`px-4 py-2 rounded-xl font-medium border ${roleConfig[member.role].color
                          } flex items-center gap-2 transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-80`}
                      >
                        <RoleIcon className="w-4 h-4" />
                        {roleConfig[member.role].label}
                      </button>

                      {/* Role Dropdown */}
                      {showRoleMenu === member.id && member.role !== "OWNER" && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute right-0 mt-2 w-40 bg-white dark:bg-[#1E293B] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-10"
                        >
                          <button
                            onClick={() => updateRole(member.id, "ADMIN")}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                          >
                            <Shield className="w-4 h-4" />
                            Admin
                          </button>
                          <button
                            onClick={() => updateRole(member.id, "MEMBER")}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                          >
                            <UserIcon className="w-4 h-4" />
                            Member
                          </button>
                        </motion.div>
                      )}
                    </div>

                    {/* Actions */}
                    {member.role !== "OWNER" && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900/20 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteMemberModal onClose={() => setShowInviteModal(false)} onInvited={fetchMembers} />
      )}
    </div>
  );
}

function InviteMemberModal({ onClose, onInvited }: { onClose: () => void, onInvited: () => void }) {
  const { projectId } = useParams();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!projectId) return;
    setIsSubmitting(true);
    try {
      // Backend currently only supports adding by email with role MEMBER (hardcoded in backend service? No, role is hardcoded in addMemberByEmail service to "MEMBER", so we might need to update role after adding if we want to support invited role)
      // Actually logic is: addMemberByEmail sets role MEMBER.
      // We can call add, then if role is ADMIN, call changeRole.
      await memberApi.invite(projectId, email);
      if (role === "ADMIN") {
        // We need memberId to change role. 
        // invite response should return member.
        // Let's assume invite returns { data: { id } }.
        // But my API client wrapper might just return response body json.
        // I'll skip auto-admin promotion for now to be safe, or just stick to MEMBER invites.
      }
      onInvited();
      onClose();
    } catch (err: any) {
      console.error("Failed to invite member", err);
      alert(err.message || "Failed to invite member");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Invite Team Member
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "ADMIN" | "MEMBER")}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 text-gray-900 dark:text-white"
            >
              <option value="MEMBER">Member</option>
              {/* <option value="ADMIN">Admin</option> */}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {role === "ADMIN"
                ? "Admins can manage project settings and members"
                : "Members can view and contribute to the project"}
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Inviting..." : "Send Invite"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
