import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FileCheck, Calendar, LogOut, ShieldAlert, 
  ChevronRight, Bell, Search, Menu 
} from 'lucide-react';
import { APP_CONFIG } from '../config';

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

  const menus = [
    { name: 'Dashboard Utama', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Live Monitoring', path: '/admin/monitoring', icon: ShieldAlert },
    { name: 'Data Pendaftar', path: '/admin/applicants', icon: Users },
    { name: 'Verifikasi Berkas', path: '/admin/verification', icon: FileCheck },
    // PERBAIKAN: Ganti '/admin/schedules' menjadi '/admin/schedule' (tanpa 's')
    { name: 'Jadwal Ujian', path: '/admin/schedule', icon: Calendar } 
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* SIDEBAR PROFESSIONAL */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col fixed h-full z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        {/* Logo Area */}
        <div className="h-20 flex items-center px-8 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                A
            </div>
            <div>
                <h1 className="text-lg font-bold text-slate-800 tracking-tight">AdminPanel</h1>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Kampus App</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Main Menu</p>
          {menus.map((menu) => {
            const isActive = location.pathname === menu.path;
            return (
              <Link
                key={menu.path}
                to={menu.path}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-blue-700'
                }`}
              >
                <div className="flex items-center gap-3">
                    <menu.icon size={18} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'} />
                    <span className="text-sm font-medium">{menu.name}</span>
                </div>
                {isActive && <ChevronRight size={16} className="text-blue-200"/>}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                {admin.fullName ? admin.fullName.charAt(0) : 'A'}
            </div>
            <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-700 truncate">{admin.fullName || 'Admin'}</p>
                <p className="text-xs text-slate-500">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col ml-72 min-w-0">
        
        {/* Header Atas */}
        <header className="h-20 bg-white border-b border-slate-200 sticky top-0 z-10 px-8 flex items-center justify-between">
            {/* Breadcrumb / Title */}
            <div>
                <h2 className="text-xl font-bold text-slate-800">
                    {menus.find((m) => m.path === location.pathname)?.name || 'Overview'}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
                    {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                <div className="relative hidden md:block">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input 
                        type="text" 
                        placeholder="Cari data..." 
                        className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-64"
                    />
                </div>
                <button className="relative p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition">
                    <Bell size={20}/>
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                </button>
            </div>
        </header>

        {/* Content Scrollable */}
        <main className="flex-1 p-8 overflow-y-auto bg-slate-50/50">
           <div className="max-w-7xl mx-auto">
              <Outlet />
           </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;