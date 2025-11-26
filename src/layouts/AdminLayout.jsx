import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FileCheck, Calendar, LogOut, ShieldAlert, 
  Menu, Bell, Search, ChevronRight, Settings 
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
    { name: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Live Monitoring', path: '/admin/monitoring', icon: ShieldAlert },
    { name: 'Data Pendaftar', path: '/admin/applicants', icon: Users },
    { name: 'Verifikasi Berkas', path: '/admin/verification', icon: FileCheck },
    { name: 'Jadwal Ujian', path: '/admin/schedule', icon: Calendar },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-900">
      
      {/* SIDEBAR (Dark Professional) */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full z-30 shadow-xl">
        {/* Brand Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/50">
              A
            </div>
            <div>
              <h1 className="text-white font-bold text-lg tracking-tight">Admin<span className="text-blue-500">Panel</span></h1>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <p className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Main Menu</p>
          {menus.map((menu) => {
            const isActive = location.pathname === menu.path;
            return (
              <Link
                key={menu.path}
                to={menu.path}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <menu.icon size={18} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
                  <span className="text-sm font-medium">{menu.name}</span>
                </div>
                {isActive && <ChevronRight size={14} className="text-blue-200" />}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Bottom */}
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold border border-slate-600">
              {admin.fullName ? admin.fullName.charAt(0) : 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{admin.fullName || 'Administrator'}</p>
              <p className="text-xs text-slate-500">Super Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2 text-xs font-bold text-red-400 hover:text-white hover:bg-red-600/20 rounded-lg transition border border-transparent hover:border-red-900"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col ml-64 min-w-0 bg-gray-50">
        
        {/* Top Header (Clean White) */}
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-20 px-8 flex items-center justify-between shadow-sm">
            {/* Page Title */}
            <div>
                <h2 className="text-lg font-bold text-slate-800">
                    {menus.find((m) => m.path === location.pathname)?.name || 'Dashboard'}
                </h2>
            </div>

            {/* Right Tools */}
            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center bg-gray-100 px-3 py-2 rounded-lg border border-transparent focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all w-64">
                    <Search size={16} className="text-gray-400 mr-2"/>
                    <input 
                        type="text" 
                        placeholder="Search data..." 
                        className="bg-transparent outline-none text-sm w-full text-slate-700"
                    />
                </div>
                
                <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition">
                    <Bell size={20}/>
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                
                <div className="h-8 w-px bg-gray-200 mx-1"></div>
                
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition">
                    <Settings size={20}/>
                </button>
            </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-8 overflow-y-auto">
           <div className="max-w-7xl mx-auto">
              <Outlet />
           </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;