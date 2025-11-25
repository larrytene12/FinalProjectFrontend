import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
// ✅ Tambahkan 'ShieldAlert' untuk ikon CCTV
import { LayoutDashboard, Users, FileCheck, Calendar, LogOut, ShieldAlert } from 'lucide-react';
import { APP_CONFIG } from '../config'; // Import Config

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    if (window.confirm('Keluar dari Panel Admin?')) {
      localStorage.clear();
      navigate('/login');
    }
  };

  // ✅ UPDATE DAFTAR MENU DI SINI
  const menus = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    
    // Menu Baru (Fitur WOW)
    { name: 'Live Monitoring (CCTV)', path: '/admin/monitoring', icon: <ShieldAlert size={20} /> },
    
    { name: 'Data Pendaftar', path: '/admin/applicants', icon: <Users size={20} /> },
    { name: 'Verifikasi Berkas', path: '/admin/verification', icon: <FileCheck size={20} /> },
    { name: 'Kelola Jadwal', path: '/admin/schedules', icon: <Calendar size={20} /> }
  ];

  return (
    <div
      className="min-h-screen flex bg-cover bg-center backdrop-blur-sm relative"
      style={{ backgroundImage: `url(${APP_CONFIG.BG_IMAGE_URL})` }}
    >
      {/* Overlay Gelap */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      {/* Konten utama harus berada di atas overlay */}
      <div className="relative flex w-full h-screen font-sans">

        {/* SIDEBAR ADMIN */}
        <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col shadow-xl border-r border-slate-700">
          <div className="p-6 border-b border-slate-700 flex items-center gap-3">
            <img
              src={APP_CONFIG.LOGO_URL}
              alt="Logo Admin"
              className="w-8 h-auto object-contain brightness-0 invert"
            />
            <div>
              <h1 className="font-bold text-lg tracking-wide leading-tight">Admin Panel</h1>
              <p className="text-xs text-slate-400">{APP_CONFIG.SHORT_NAME}</p>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2 mt-4">
            {menus.map((menu) => (
              <Link
                key={menu.path}
                to={menu.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  location.pathname === menu.path
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {menu.icon}
                <span className="font-medium">{menu.name}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-700">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-400 hover:bg-slate-800 rounded-lg transition"
            >
              <LogOut size={20} />
              <span>Keluar</span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center z-10">
            <h2 className="text-xl font-bold text-gray-800">
              {menus.find((m) => m.path === location.pathname)?.name || 'Dashboard'}
            </h2>
            <div className="flex items-center gap-3">
              <div className="text-right mr-2">
                <p className="text-sm font-bold text-gray-700">{admin.fullName}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                A
              </div>
            </div>
          </header>

          {/* Area Konten (Outlet) */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;