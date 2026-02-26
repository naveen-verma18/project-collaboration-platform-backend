import { ReactNode } from "react";
import { Navigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

interface ProtectedRouteProps {
    children: ReactNode;
}

/**
 * Renders children only when the user is authenticated.
 * Shows a loading spinner while the auth state is being initialized.
 * Redirects to /login otherwise.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, token, isLoading } = useAuth();

    // Wait until auth state has been read from localStorage / validated
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F6F7FB] dark:bg-[#0F172A]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Loading…
                    </p>
                </div>
            </div>
        );
    }

    // Both user object AND token must be present for access
    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}
