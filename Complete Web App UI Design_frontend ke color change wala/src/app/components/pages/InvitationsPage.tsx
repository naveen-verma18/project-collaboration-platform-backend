import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Inbox, Check, X, Clock } from "lucide-react";
import { Sidebar } from "../shared/Sidebar";
import { Navbar } from "../shared/Navbar";
import { invitations as invitationsApi } from "../../api/services";
import { toast } from "sonner";

interface InvitationsPageProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

interface Invitation {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  project: {
    id: string;
    name: string;
    description?: string;
  };
  invitedByUser: {
    id: string;
    name: string | null;
    email: string;
  };
}

export function InvitationsPage({ theme, toggleTheme }: InvitationsPageProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actioningId, setActioningId] = useState<string | null>(null);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await invitationsApi.getMy();
      const data = res.data as any[];
      setInvitations(
        data.map((inv) => ({
          ...inv,
          createdAt: new Date(inv.createdAt).toLocaleString(),
        }))
      );
    } catch (err: any) {
      console.error("Failed to load invitations", err);
      setError(err.message || "Failed to load invitations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  const handleAction = async (id: string, action: "accept" | "reject") => {
    try {
      setActioningId(id);
      if (action === "accept") {
        await invitationsApi.accept(id);
        toast.success("Invitation accepted. The project is now available in your dashboard.");
      } else {
        await invitationsApi.reject(id);
        toast.success("Invitation rejected.");
      }
      await loadInvitations();
    } catch (err: any) {
      console.error("Failed to update invitation", err);
      setError(err.message || "Failed to update invitation");
      toast.error(err.message || "Failed to update invitation");
    } finally {
      setActioningId(null);
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
                  <Inbox className="w-8 h-8 text-indigo-600" />
                  Invitations
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Review and respond to project invitations
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              </div>
            ) : invitations.length === 0 ? (
              <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Inbox className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">You have no pending invitations.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {invitations.map((invitation, index) => (
                  <motion.div
                    key={invitation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-gray-700 p-5 flex items-center justify-between"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {invitation.project.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Invited by{" "}
                          <span className="font-medium">
                            {invitation.invitedByUser.name || invitation.invitedByUser.email}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {invitation.createdAt}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAction(invitation.id, "reject")}
                        disabled={actioningId === invitation.id}
                        className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                      >
                        <span className="flex items-center gap-2">
                          <X className="w-4 h-4" />
                          Reject
                        </span>
                      </button>
                      <button
                        onClick={() => handleAction(invitation.id, "accept")}
                        disabled={actioningId === invitation.id}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:from-indigo-700 hover:to-purple-700 flex items-center gap-2 disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        {actioningId === invitation.id ? "Processing..." : "Accept"}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

