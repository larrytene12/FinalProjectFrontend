import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// ================= AUTH PAGES =================
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// ================= ADMIN PAGES =================
import AdminDashboard from "./pages/admin/AdminDashboard";
import LiveMonitoring from "./pages/admin/LiveMonitoring";
import ApplicantsPage from "./pages/admin/ApplicantsPage";
import VerificationPage from "./pages/admin/VerificationPage";
import ScheduleManagerPage from "./pages/admin/ScheduleManagerPage";

// ================= STUDENT PAGES =================
import StudentDashboard from "./pages/student/StudentDashboard";
import BiodataPage from "./pages/student/BiodataPage";
import DocumentPage from "./pages/student/DocumentPage";
import ExamSchedulePage from "./pages/student/ExamSchedulePage";
import PaymentPage from "./pages/student/PaymentPage";
import CBTPage from "./pages/student/CBTPage";

// ✅ IMPORT BARU
import AnnouncementPage from "./pages/student/AnnouncementPage";

// ================= LAYOUTS =================
import AdminLayout from "./layouts/AdminLayout";
import StudentLayout from "./layouts/StudentLayout";

export default function App() {
  return (
    <Router>
      <Routes>

        {/* ================= AUTH ROUTES ================= */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ================= ADMIN ROUTES ================= */}
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="monitoring" element={<LiveMonitoring />} />
          <Route path="applicants" element={<ApplicantsPage />} />
          <Route path="verification" element={<VerificationPage />} />
          <Route path="schedule" element={<ScheduleManagerPage />} />
        </Route>

        {/* ================= STUDENT ROUTES ================= */}
        <Route path="/student/*" element={<StudentLayout />}>
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="biodata" element={<BiodataPage />} />
          <Route path="documents" element={<DocumentPage />} />
          <Route path="schedule" element={<ExamSchedulePage />} />
          <Route path="exam-schedule" element={<ExamSchedulePage />} />
          <Route path="payment" element={<PaymentPage />} />
          <Route path="cbt" element={<CBTPage />} />

          {/* ✅ ROUTE BARU DI SINI */}
          <Route path="announcement" element={<AnnouncementPage />} />
        </Route>

        {/* ================= REDIRECT UNKNOWN ROUTES ================= */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </Router>
  );
}
