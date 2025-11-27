import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  FileText,
  Calendar,
  LogOut,
  CreditCard,
  PenTool,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { APP_CONFIG } from "../config";

const StudentLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    if (window.confirm("Yakin ingin keluar?")) {
      localStorage.clear();
      navigate("/login");
    }
  };

  const menus = [
    { name: "Dashboard", path: "/student/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Isi Biodata", path: "/student/biodata", icon: <User size={20} /> },
    { name: "Pembayaran", path: "/student/payment", icon: <CreditCard size={20} /> },
    { name: "Upload Berkas", path: "/student/documents", icon: <FileText size={20} /> },
    { name: "Ujian Online", path: "/student/cbt", icon: <PenTool size={20} /> },
    { name: "Jadwal & Kartu", path: "/student/schedule", icon: <Calendar size={20} /> },
    { name: "Pengumuman", path: "/student/announcement", icon: <Sparkles size={20} /> },
  ];

  return (
    <div className="flex h-screen relative overflow-hidden">

      {/* BACKGROUND PHOTO + ANIMATION */}
      <div className="absolute inset-0 -z-10">

        {/* --- FOTO BACKGROUND --- */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url("/background.jpg")`, // FOTO KAMU DI SINI
          }}
        />

        {/* --- GRADIENT OVERLAY --- */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(7,16,40,0.75), rgba(76,42,255,0.35) 50%, rgba(200,210,255,0.25) 100%)",
          }}
        />

        {/* --- ANIMATED WATER GRADIENT --- */}
        <div
          className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none water-flow-bg"
        />

        {/* BOKEH GLOW EFFECT */}
        <div className="absolute inset-0">
          <div className="absolute w-64 h-64 bg-white/10 blur-3xl rounded-full top-20 left-10" />
          <div className="absolute w-72 h-72 bg-white/5 blur-3xl rounded-full bottom-10 right-10" />
          <div className="absolute w-40 h-40 bg-blue-400/10 blur-2xl rounded-full top-1/2 left-1/2" />
        </div>
      </div>

      {/* -- ANIMATED KEYFRAMES FIX -- */}
      <style>
        {`
          @keyframes waterFlow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          .water-flow-bg {
            background:
              radial-gradient(circle at 20% 30%, rgba(255,255,255,0.35), transparent 60%),
              radial-gradient(circle at 80% 70%, rgba(150,180,255,0.25), transparent 50%),
              linear-gradient(120deg, rgba(255,255,255,0.05), rgba(255,255,255,0.15), rgba(255,255,255,0.05));
            background-size: 200% 200%;
            animation: waterFlow 8s ease-in-out infinite;
            filter: blur(35px);
          }
        `}
      </style>

      {/* SIDEBAR */}
      <aside className="w-72 bg-white/70 backdrop-blur-xl border-r border-gray-200 hidden md:flex flex-col z-20 fixed h-full shadow-[4px_0_24px_rgba(0,0,0,0.05)]">

        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 text-white font-bold text-xl">
            P
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800 tracking-tight leading-none">
              {APP_CONFIG.SHORT_NAME}
            </h1>
            <p className="text-xs text-gray-400 font-medium mt-1">Student Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-4">
          <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Main Menu
          </p>

          {menus.map((menu) => {
            const isActive = location.pathname === menu.path;
            return (
              <Link
                key={menu.path}
                to={menu.path}
                className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold shadow-sm"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
                )}
                <span
                  className={`transition-colors ${
                    isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                  }`}
                >
                  {menu.icon}
                </span>
                <span>{menu.name}</span>
                {isActive && <ChevronRight size={16} className="ml-auto text-blue-400" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 mx-4 mb-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 rounded-xl transition font-medium"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 md:ml-72 flex flex-col min-w-0">
        <header className="bg-white/60 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-10 px-8 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {menus.find((m) => m.path === location.pathname)?.name || "Dashboard"}
            </h2>
            <p className="text-sm text-gray-500">Selamat datang kembali, Semangat belajar!</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-700">{user.fullName}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-[2px]">
              <img
                src={
                  user.documents?.foto ||
                  `https://ui-avatars.com/api/?name=${user.fullName}&background=random`
                }
                alt="Avatar"
                className="w-full h-full rounded-full border-2 border-white object-cover"
              />
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
