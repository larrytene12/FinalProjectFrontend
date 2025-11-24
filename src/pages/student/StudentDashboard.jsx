import React, { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Clock, ArrowRight, ShieldCheck, Sparkles, GraduationCap, BookOpen, Printer, Calendar, FileText, User, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user'));
    setUser(u);
  }, []);

  if (!user) return <div className="p-20 text-center font-bold text-white text-xl animate-pulse">Memuat Portal Canggih...</div>;

  const currentStep = user.registrationStep || 1;
  const isVerified = user.verificationStatus === "Verified";

  const steps = [
    { id: 1, title: 'Biodata Diri', link: '/student/biodata', desc: 'Isi identitas lengkap', icon: User, color: 'from-blue-500 to-cyan-400' },
    { id: 2, title: 'Administrasi', link: '/student/payment', desc: 'Pembayaran formulir', icon: Star, color: 'from-orange-500 to-yellow-400' },
    { id: 3, title: 'Upload Berkas', link: '/student/documents', desc: 'Ijazah & Foto', icon: FileText, color: 'from-pink-500 to-rose-400' },
    { id: 4, title: 'Verifikasi', status: user.verificationStatus || 'Pending', desc: 'Cek validasi admin', icon: ShieldCheck, color: 'from-purple-500 to-indigo-400' },
    { id: 5, title: 'Pilih Jadwal', link: '/student/schedule', locked: !isVerified, desc: 'Booking kursi ujian', icon: Calendar, color: 'from-green-500 to-emerald-400' },
    { id: 6, title: 'Cetak Kartu', link: '/student/schedule', locked: !user.scheduleId, desc: 'Tiket masuk ujian', icon: Printer, color: 'from-gray-700 to-slate-600' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-12">

      {/* 1. HERO BANNER: 3D STYLE */}
      <div className="relative rounded-[2.5rem] bg-gray-900 p-10 overflow-hidden shadow-2xl transform transition hover:scale-[1.01] duration-500">
        {/* Background Video/Image Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-90"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-pink-500 rounded-full blur-[100px] opacity-50 animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500 rounded-full blur-[100px] opacity-50"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-white space-y-4">
                <div className="inline-block px-4 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-bold tracking-widest uppercase">
                    UNIVERSITAS KLABAT
                </div>
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
                    Halo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">{user.fullName.split(' ')[0]}</span>!
                </h1>
                <p className="text-lg text-indigo-100 font-medium max-w-lg">
                    Selamat datang di awal perjalanan barumu. Semua proses pendaftaran kini lebih cepat, mudah, dan transparan.
                </p>
            </div>
            
            {/* Status Card Melayang */}
            <div className="glass-card bg-white/10 p-6 rounded-3xl text-center min-w-[240px] border-none ring-1 ring-white/30 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-2">Status Pendaftaran</p>
                <div className="text-3xl font-black text-white drop-shadow-lg">
                    {user.status || "Draft"}
                </div>
                <div className="mt-2 text-xs text-white/70">Terupdate Otomatis</div>
            </div>
        </div>
      </div>

      {/* 2. MENU GRID: BENTO BOX STYLE */}
      <div>
        <h3 className="text-2xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
           <span className="w-2 h-8 bg-purple-600 rounded-full"></span> Pendaftaran
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((step) => {
                const isCompleted = currentStep > step.id || (step.id === 4 && isVerified);
                const isActive = currentStep === step.id;
                const isLocked = step.locked;
                const Icon = step.icon;

                return (
                    <div key={step.id} className={`glass-card relative p-6 rounded-[2rem] flex flex-col justify-between h-56 group overflow-hidden
                        ${isLocked ? 'opacity-60 grayscale' : 'cursor-pointer'}
                    `}>
                        {/* Background Gradient Halus saat Hover */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>

                        <div className="flex justify-between items-start z-10">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br ${step.color} transition-transform group-hover:scale-110 duration-300`}>
                                {isCompleted ? <CheckCircle2 size={28}/> : <Icon size={28} />}
                            </div>
                            <span className="text-4xl font-black text-gray-200 group-hover:text-gray-300 transition-colors">0{step.id}</span>
                        </div>

                        <div className="z-10 mt-4">
                            <h4 className="text-2xl font-bold text-gray-800 group-hover:text-purple-700 transition-colors">{step.title}</h4>
                            <p className="text-sm text-gray-500 font-medium mt-1">{step.desc}</p>
                        </div>

                        <div className="z-10 mt-auto pt-4 flex items-center justify-between">
                            {!isLocked && step.link ? (
                                <Link to={step.link} className="w-full">
                                    <button className="w-full py-2 bg-gray-50 group-hover:bg-purple-600 group-hover:text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                                        Buka Misi <ArrowRight size={16}/>
                                    </button>
                                </Link>
                            ) : isLocked ? (
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                                    <div className="w-2 h-2 bg-red-400 rounded-full"></div> Terkunci
                                </div>
                            ) : (
                                <div className={`px-4 py-1 rounded-full text-xs font-bold border ${step.status === 'Verified' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                                    {step.status}
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
      </div>

      {/* 3. INFO WIDGETS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="glass-card p-8 rounded-[2rem] flex items-center gap-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 animate-bounce-slow">
                <BookOpen size={40}/>
            </div>
            <div>
                <p className="text-sm font-bold text-gray-400 uppercase">Jurusan Pilihan</p>
                <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                    {user.major || "Belum Memilih"}
                </h3>
            </div>
         </div>
         <div className="glass-card p-8 rounded-[2rem] flex items-center gap-6">
            <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 animate-bounce-slow" style={{animationDelay: '0.5s'}}>
                <GraduationCap size={40}/>
            </div>
            <div>
                <p className="text-sm font-bold text-gray-400 uppercase">Asal Sekolah</p>
                <h3 className="text-2xl font-extrabold text-gray-800">
                    {user.schoolOrigin || "-"}
                </h3>
            </div>
         </div>
      </div>

    </div>
  );
};

export default StudentDashboard;