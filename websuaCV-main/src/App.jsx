import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import PageNotFound from "./lib/PageNotFound";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import ScrollToTop from "./components/ScrollToTop";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import CVBuilder from "./pages/CVBuilder";
import CVStart from "./pages/CVStart";
import MatchAnalysis from "./pages/MatchAnalysis";
import CVVersions from "./pages/CVVersions";
import AdminDatabase from "./pages/AdminDatabase";

const AuthenticatedApp = () => {
  const {
    isLoadingAuth,
  } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/profile"
        element={<Profile />}
      />

      <Route
        path="/dashboard"
        element={<Dashboard />}
      />

      <Route
        path="/jobs"
        element={<Jobs />}
      />

      <Route
        path="/jobs/:id"
        element={<JobDetail />}
      />

      <Route
        path="/cv-start"
        element={<CVStart />}
      />

      <Route
        path="/cv-builder"
        element={<CVBuilder />}
      />

      <Route
        path="/match-analysis"
        element={<MatchAnalysis />}
      />

      <Route
        path="/match"
        element={<MatchAnalysis />}
      />

      <Route
        path="/cv-versions"
        element={<CVVersions />}
      />

      <Route
        path="/admin"
        element={<AdminDatabase />}
      />

      <Route
        path="/database"
        element={<AdminDatabase />}
      />

      <Route
        path="*"
        element={<PageNotFound />}
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider
        client={queryClientInstance}
      >
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>

        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
