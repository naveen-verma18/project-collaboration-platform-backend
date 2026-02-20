import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { useState, useEffect } from "react";
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

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <LoginPage onLogin={() => setIsAuthenticated(true)} />
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <RegisterPage onRegister={() => setIsAuthenticated(true)} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Dashboard theme={theme} toggleTheme={toggleTheme} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/project/:projectId"
          element={
            isAuthenticated ? (
              <ProjectWorkspace theme={theme} toggleTheme={toggleTheme} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/projects"
          element={
            isAuthenticated ? (
              <ProjectsPage theme={theme} toggleTheme={toggleTheme} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/goals"
          element={
            isAuthenticated ? (
              <GoalsPage theme={theme} toggleTheme={toggleTheme} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/documents"
          element={
            isAuthenticated ? (
              <DocumentsPage theme={theme} toggleTheme={toggleTheme} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/decisions"
          element={
            isAuthenticated ? (
              <DecisionsPage theme={theme} toggleTheme={toggleTheme} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/activity"
          element={
            isAuthenticated ? (
              <ActivityPage theme={theme} toggleTheme={toggleTheme} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/team"
          element={
            isAuthenticated ? (
              <TeamPage theme={theme} toggleTheme={toggleTheme} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/settings"
          element={
            isAuthenticated ? (
              <SettingsPage theme={theme} toggleTheme={toggleTheme} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
