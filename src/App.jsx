import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// ================= AUTH PAGES =================
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// ================= ADMIN PAGES =================
import AdminDashboard from "./pages/admin/AdminDashboard";
import ApplicantsPage from "./pages/admin/ApplicantsPage";
import VerificationPage from "./pages/admin/VerificationPage";
import ScheduleManagerPage from "./pages/admin/ScheduleManagerPage";

// ================= LAYOUTS =================
import AdminLayout from "./layouts/AdminLayout";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* ================= AUTH ROUTES ================= */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ================= ADMIN ROUTES WITH LAYOUT ================= */}
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="applicants" element={<ApplicantsPage />} />
          <Route path="verification" element={<VerificationPage />} />
          <Route path="schedule" element={<ScheduleManagerPage />} />
        </Route>

        {/* ================= REDIRECT ANY UNKNOWN ROUTES ================= */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
