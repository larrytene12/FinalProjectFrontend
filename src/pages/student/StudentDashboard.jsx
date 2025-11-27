import React, { useEffect, useState } from 'react';
import {
  CheckCircle2, ArrowRight, ShieldCheck, GraduationCap, BookOpen,
  Printer, Calendar, FileText, User, Star, Lock, AlertCircle, LogIn, Clock,
  ChevronRight, Bell, Download, Zap, Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('clinicUser') || localStorage.getItem('user'));
    setUser(u);
  }, []);

  if (!user) {
     return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in zoom-in">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <User size={48} className="text-slate-400"/>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Sesi Berakhir</h2>
            <p className="text-slate-500 mb-8 max-w-md">
                Data mahasiswa tidak ditemukan. Hal ini bisa terjadi karena database baru saja diperbarui. Silakan login kembali.
            </p>
            <button 
                onClick={() => navigate('/login')}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg flex items-center gap-2"
            >
                <LogIn size={20}/> Login Ulang
            </button>
        </div>
    );
  }

  // --- LOGIKA DETEKSI STATUS (LEBIH CERDAS) ---
  const isPaid = user.paymentStatus === 'Paid';
  const isUploaded = user.documents?.ijazah && user.documents?.foto;
  const isVerified = user.verificationStatus === "Verified";
  const hasSchedule = !!user.scheduleId;
  const isExamFinished = user.examStatus === 'Selesai' || user.examStatus === 'Diskualifikasi';

  // Definisi Langkah & Status Selesainya
  const steps = [
    { 
        id: 1, 
        title: 'Biodata Diri', 
        link: '/student/biodata', 
        desc: 'Identitas & Latar Belakang', 
        icon: User, 
        detail: 'Lengkapi data diri.',
        completed: true // Selalu true karena user sudah login
    },
    { 
        id: 2, 
        title: 'Administrasi', 
        link: '/student/payment', 
        desc: 'Pembayaran Formulir', 
        icon: Star, 
        detail: 'Selesaikan pembayaran.',
        completed: isPaid
    },
    { 
        id: 3, 
        title: 'Dokumen Pendukung', 
        link: '/student/documents', 
        desc: 'Upload Berkas', 
        icon: FileText, 
        detail: 'Ijazah & Foto terbaru.',
        completed: isUploaded
    },
    { 
        id: 4, 
        title: 'Verifikasi Berkas', 
        status: user.verificationStatus || 'Pending', 
        desc: 'Validasi Panitia', 
        icon: ShieldCheck, 
        detail: 'Menunggu pengecekan.',
        completed: isVerified
    },
    { 
        id: 5, 
        title: 'Jadwal Ujian', 
        link: '/student/schedule', 
        locked: !isVerified, 
        desc: 'Sesi Seleksi', 
        icon: Calendar, 
        detail: 'Pilih waktu ujian.',
        completed: hasSchedule
    },
    { 
        id: 6, 
        title: 'Kartu Peserta', 
        link: '/student/schedule', 
        locked: !hasSchedule, 
        desc: 'Cetak Bukti', 
        icon: Printer, 
        detail: 'Unduh kartu peserta.',
        completed: hasSchedule // Selesai jika jadwal sudah dipilih
    },
    { 
        id: 7, 
        title: 'Pengumuman', 
        link: '/student/announcement', 
        locked: !isExamFinished, 
        desc: 'Hasil Seleksi', 
        icon: Sparkles, 
        detail: 'Cek status kelulusan.',
        completed: isExamFinished
    }
  ];

  // Hitung Persentase Berdasarkan Langkah yang COMPLETED
  const completedCount = steps.filter(s => s.completed).length;
  const progressPercent = Math.round((completedCount / 7) * 100);

  // Tentukan langkah aktif (Langkah pertama yang belum completed)
  const activeStep = steps.find(s => !s.completed)?.id || 8; // 8 artinya semua selesai

   const getStatusBadge = (status) => {
      const styles = {
          'Verified': 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
          'Diterima': 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
          'Lulus': 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
          'Rejected': 'bg-red-50 text-red-700 border-red-200 ring-red-500/20',
          'Ditolak': 'bg-red-50 text-red-700 border-red-200 ring-red-500/20',
          'Draft': 'bg-slate-50 text-slate-600 border-slate-200 ring-slate-500/20',
      };
      const defaultStyle = 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20';
      
      return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ring-1 uppercase tracking-wide shadow-sm ${styles[status] || defaultStyle}`}>
            {status}
        </span>
      );
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 font-sans text-slate-800 relative">
        
        {/* Background Decoration (Subtle) */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b from-blue-50/50 to-transparent rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="space-y-8">
            {/* 1. HEADER HERO (Modern & Clean) */}
            <div className="relative bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-75 group-hover:opacity-100 transition duration-500 blur"></div>
                            <div className="relative w-20 h-20 rounded-full bg-white p-1">
                                <div className="w-full h-full rounded-full overflow-hidden bg-slate-50">
                                    {user.documents?.foto ? (
                                        <img src={user.documents.foto} alt="Profil" className="w-full h-full object-cover"/>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400"><User size={32}/></div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                                Selamat Datang, {user.fullName.split(' ')[0]}!
                            </h1>
                            <p className="text-slate-500 mt-1 font-medium flex items-center gap-2">
                                Calon Mahasiswa <span className="w-1 h-1 bg-slate-300 rounded-full"></span> 2025/2026
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                         <div className="text-right hidden md:block">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status Aplikasi</p>
                            {getStatusBadge(user.status || 'Draft')}
                         </div>
                         <div className="w-px h-10 bg-slate-100 hidden md:block"></div>
                         <div className="text-right hidden md:block">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Kelengkapan</p>
                            <div className="flex items-center gap-2 justify-end">
                                <span className={`text-xl font-black ${progressPercent === 100 ? 'text-emerald-600' : 'text-blue-600'}`}>{progressPercent}%</span>
                                <div className="w-8 h-8">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="16" cy="16" r="14" stroke="#e2e8f0" strokeWidth="4" fill="transparent" />
                                        <circle 
                                            cx="16" cy="16" r="14" 
                                            stroke={progressPercent === 100 ? "#10b981" : "#2563eb"} 
                                            strokeWidth="4" fill="transparent" 
                                            strokeDasharray={88} 
                                            strokeDashoffset={88 - (88 * progressPercent) / 100} 
                                            className="transition-all duration-1000 ease-out"
                                        />
                                    </svg>
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT: Timeline Progress (Modern Card) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Zap className="text-yellow-500 fill-yellow-500" size={20}/> Tahapan Seleksi
                        </h3>
                        <span className="text-xs font-medium text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                            Gelombang 1
                        </span>
                    </div>

                    <div className="grid gap-4">
                        {steps.map((step) => {
                            const isActive = activeStep === step.id;
                            
                            return (
                                <div 
                                    key={step.id}
                                    className={`group relative flex items-center p-5 rounded-2xl border transition-all duration-300 ease-out
                                        ${isActive 
                                            ? 'bg-white border-blue-500 shadow-lg shadow-blue-500/10 scale-[1.02] z-10' 
                                            : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-md'
                                        }
                                        ${step.locked ? 'opacity-60 grayscale bg-slate-50' : ''}
                                    `}
                                >
                                    {/* Status Indicator */}
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 mr-5 transition-colors
                                        ${step.completed ? 'bg-emerald-100 text-emerald-600' : 
                                          isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-300' : 
                                          'bg-slate-100 text-slate-400'}
                                    `}>
                                        {step.completed ? <CheckCircle2 size={24}/> : 
                                         isActive ? <step.icon size={24} className="animate-pulse"/> : 
                                         step.locked ? <Lock size={20}/> : <step.icon size={20}/>}
                                    </div>

                                    {/* Text Content */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <h4 className={`font-bold text-lg ${isActive ? 'text-slate-800' : 'text-slate-600'}`}>
                                                {step.title}
                                            </h4>
                                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">STEP 0{step.id}</span>
                                        </div>
                                        <p className="text-sm text-slate-500 mt-0.5">{step.detail}</p>
                                    </div>

                                    {/* Action Button */}
                                    <div className="ml-4 shrink-0">
                                        {step.status && step.id === 4 ? (
                                            getStatusBadge(step.status)
                                        ) : !step.locked && (
                                            <Link to={step.link} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                                isActive ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-slate-50 text-slate-400 group-hover:text-slate-600'
                                            }`}>
                                                <ChevronRight size={20}/>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* RIGHT: Info Panels */}
                <div className="space-y-6">
                    
                    {/* Current Status Widget */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                        <div className="relative z-10">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Status Verifikasi</p>
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`w-3 h-3 rounded-full ${isVerified ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-amber-400 animate-pulse'}`}></div>
                                <span className="text-3xl font-black tracking-tight">{user.verificationStatus || 'Pending'}</span>
                            </div>
                            <div className="bg-white/10 rounded-xl p-4 text-xs text-slate-300 leading-relaxed backdrop-blur-sm border border-white/5">
                                {isVerified 
                                    ? "Selamat! Dokumen Anda valid. Silakan lanjutkan ke tahap pemilihan jadwal ujian." 
                                    : "Berkas Anda sedang dalam antrian verifikasi admin. Estimasi waktu: 1x24 Jam."}
                            </div>
                        </div>
                    </div>

                    {/* Academic Info */}
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                        <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><GraduationCap size={18}/></div>
                            Data Akademik
                        </h4>
                        <div className="space-y-5">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Asal Sekolah</span>
                                <span className="text-sm font-bold text-slate-800 text-right">{user.schoolOrigin || '-'}</span>
                            </div>
                            <div className="w-full h-px bg-slate-100"></div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Tahun Lulus</span>
                                <span className="text-sm font-bold text-slate-800">{user.gradYear || '-'}</span>
                            </div>
                            <div className="w-full h-px bg-slate-100"></div>
                             <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Jurusan Pilihan</span>
                                <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{user.major || '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Download Widget */}
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm group cursor-pointer hover:border-blue-300 transition-colors">
                         <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <Download size={18} className="text-slate-400"/> Unduh Panduan
                        </h4>
                        <p className="text-xs text-slate-500 mb-4">Panduan lengkap prosedur PMB 2025.</p>
                        <a 
                            href="/panduan_pmb.pdf" 
                            download="Panduan_PMB_2025.pdf"
                            className="w-full py-2.5 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-100 transition flex items-center justify-center gap-2"
                        >
                            <FileText size={16}/> Download PDF
                        </a>
                    </div>

                </div>
            </div>
        </div>
    </div>
  );
};

export default StudentDashboard;