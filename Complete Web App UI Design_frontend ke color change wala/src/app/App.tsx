import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { useState, useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { LoginPage } from "./components/auth/LoginPage";
import { RegisterPage } from "./components/auth/RegisterPage";
import { Dashboard } from "./components/dashboard/Dashboard";
import { ProjectWorkspace } from "./components/project/ProjectWorkspace";
import { ProjectsPage } from "./components/pages/ProjectsPage";
import { GoalsPage } from "./components/pages/GoalsPage";
import { DocumentsPage } from "./components/pages/DocumentsPage";
import { DecisionsPage } from "./components/pages/DecisionsPage";
import { ActivityPage } from "./components/pages/ActivityPage";
import { TeamPage } from "./components/pages/TeamPage";
import { SettingsPage } from "./components/pages/SettingsPage";
import { InvitationsPage } from "./components/pages/InvitationsPage";
import EditorPage from "./pages/EditorPage";
import { Toaster } from "./components/ui/sonner";

// ─── Inner app needs access to AuthContext so it lives inside AuthProvider ───

function AppRoutes() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark";
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  // Shared theme props passed to every protected page
  const themeProps = { theme, toggleTheme };

  return (
    <Routes>
      {/* ── Public routes ────────────────────────────────────────────── */}
      <Route
        path="/login"
        element={
          // If already authenticated, skip login page
          !isLoading && user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route
        path="/register"
        element={
          !isLoading && user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <RegisterPage />
          )
        }
      />

      {/* ── Protected routes ─────────────────────────────────────────── */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard {...themeProps} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/project/:projectId"
        element={
          <ProtectedRoute>
            <ProjectWorkspace {...themeProps} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <ProjectsPage {...themeProps} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/goals"
        element={
          <ProtectedRoute>
            <GoalsPage {...themeProps} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/documents"
        element={
          <ProtectedRoute>
            <DocumentsPage {...themeProps} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/decisions"
        element={
          <ProtectedRoute>
            <DecisionsPage {...themeProps} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/activity"
        element={
          <ProtectedRoute>
            <ActivityPage {...themeProps} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/team"
        element={
          <ProtectedRoute>
            <TeamPage {...themeProps} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invitations"
        element={
          <ProtectedRoute>
            <InvitationsPage {...themeProps} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage {...themeProps} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/project/:projectId/documents/:documentId/edit"
        element={
          <ProtectedRoute>
            <EditorPage />
          </ProtectedRoute>
        }
      />

      {/* ── Default: redirect to login ────────────────────────────────── */}
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <>
          <AppRoutes />
          <Toaster position="top-right" />
        </>
      </AuthProvider>
    </BrowserRouter>
  );
}
