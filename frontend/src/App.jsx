import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import UploadResumePage from "./pages/UploadResumePage";
import InterviewPage from "./pages/InterviewPage";
import AdminPage from "./pages/AdminPage";
import OnboardingPage from "./pages/OnboardingPage";
import CodingRoundPage from "./pages/CodingRoundPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "warm");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="app-shell">
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />
      <div className="ambient ambient-c" />
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <header className="topbar">
        <h1>AI Interview Platform</h1>
        {user && (
          <div className="topbar-right">
            <nav className="nav-pills" aria-label="Primary">
              <Link className={location.pathname === "/dashboard" ? "active" : ""} to="/dashboard">
                Dashboard
              </Link>
              <Link className={location.pathname === "/resume" ? "active" : ""} to="/resume">
                Resume
              </Link>
              <Link className={location.pathname === "/interview" ? "active" : ""} to="/interview">
                Interview
              </Link>
              <Link className={location.pathname === "/coding" ? "active" : ""} to="/coding">
                Coding
              </Link>
            </nav>
            <span>{user.name}</span>
            <button
              className="ghost-btn"
              onClick={() => setTheme((t) => (t === "warm" ? "slate" : "warm"))}
            >
              Theme: {theme}
            </button>
            <button className="danger-btn" onClick={logout}>
              Logout
            </button>
          </div>
        )}
      </header>

      <main className="container" id="main-content" tabIndex={-1}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume"
            element={
              <ProtectedRoute>
                <UploadResumePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview"
            element={
              <ProtectedRoute>
                <InterviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coding"
            element={
              <ProtectedRoute>
                <CodingRoundPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </main>
    </div>
  );
}
