import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, QrCode, Download, Clock, CheckCircle, Lock, FileSearch, XCircle, AlertTriangle } from 'lucide-react';
// CORRECTED IMPORT PATH:
import Button from '../../components/ui/Button'; 
import { useNavigate } from 'react-router-dom';

const ExamSchedulePage = () => {
  const navigate = useNavigate();
  
  // Ambil data user (Cek kedua key 'clinicUser' atau 'user' untuk kompatibilitas)
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('clinicUser') || localStorage.getItem('user')));
  
  const [schedules, setSchedules] = useState([]);
  const [mySchedule, setMySchedule] = useState(null);
  
  // STATE UNTUK PENGECEKAN AKSES
  const [accessStatus, setAccessStatus] = useState('checking'); // checking | locked | granted
  const [lockMessage, setLockMessage] = useState({ title: '', desc: '', icon: null });

  useEffect(() => {
    if(user) checkPermission();
  }, [user]);

  const checkPermission = async () => {
    // 1. CEK PEMBAYARAN
    if (user.paymentStatus !== 'Paid') {
      setAccessStatus('locked');
      setLockMessage({
        title: 'Pembayaran Belum Lunas',
        desc: 'Anda harus menyelesaikan pembayaran formulir sebelum bisa memilih jadwal ujian.',
        icon: <Lock size={48} className="text-red-500" />
      });
      return;
    }

    // 2. CEK VERIFIKASI ADMIN 
    if (user.verificationStatus === 'Pending') {
      setAccessStatus('locked');
      setLockMessage({
        title: 'Menunggu Verifikasi Admin',
        desc: 'Berkas Anda sedang diperiksa oleh Panitia PMB. Mohon tunggu persetujuan admin untuk membuka jadwal ujian.',
        icon: <FileSearch size={48} className="text-yellow-500" />
      });
      return;
    }

    // 3. CEK JIKA DITOLAK
    if (user.verificationStatus === 'Rejected') {
      setAccessStatus('locked');
      setLockMessage({
        title: 'Berkas Ditolak',
        desc: 'Mohon maaf, berkas Anda dinilai tidak memenuhi syarat. Silakan hubungi panitia atau perbaiki dokumen.',
        icon: <XCircle size={48} className="text-red-500" />
      });
      return;
    }

    // 4. JIKA LOLOS SEMUA -> AMBIL DATA JADWAL (PORT 3032)
    try {
      const res = await fetch('http://localhost:3032/schedules');
      const data = await res.json();
      setSchedules(data);
      setAccessStatus('granted');

      // Cek apakah user sudah punya jadwal sebelumnya
      if (user.scheduleId) {
        const selected = data.find(s => s.id === user.scheduleId);
        setMySchedule(selected);
      }
    } catch (error) {
      console.error("Gagal koneksi server", error);
      setAccessStatus('locked');
      setLockMessage({
          title: 'Gagal Terhubung Server',
          desc: 'Pastikan JSON Server berjalan di Port 3032.',
          icon: <AlertTriangle size={48} className="text-red-500"/>
      });
    }
  };

  const handleSelect = async (scheduleId, currentFilled) => {
    if(!window.confirm("Yakin pilih jadwal ini?")) return;

    try {
        // Update Server (PORT 3032)
        await fetch(`http://localhost:3032/users/${user.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scheduleId: scheduleId, registrationStep: 4 }) // Step naik ke 4
        });
        
        await fetch(`http://localhost:3032/schedules/${scheduleId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filled: currentFilled + 1 })
        });

        // Update Local Storage
        const updatedUser = { ...user, scheduleId, registrationStep: 4 };
        localStorage.setItem('clinicUser', JSON.stringify(updatedUser)); 
        localStorage.setItem('user', JSON.stringify(updatedUser)); 
        setUser(updatedUser);
        
        alert("Jadwal Berhasil Dipilih!");
        window.location.reload();
    } catch (error) {
        alert("Gagal menyimpan jadwal. Cek koneksi server (Port 3032).");
    }
  };

  // --- TAMPILAN 1: LOADING ---
  if (accessStatus === 'checking') {
    return <div className="p-10 text-center text-gray-500 font-medium animate-pulse">Memeriksa status kelulusan berkas...</div>;
  }

  // --- TAMPILAN 2: TERKUNCI (LOCKED STATE) ---
  if (accessStatus === 'locked') {
    return (
      <div className="max-w-xl mx-auto mt-8 bg-white border border-gray-200 rounded-3xl shadow-lg p-10 text-center">
        <div className="mb-6 flex justify-center bg-gray-50 w-24 h-24 rounded-full items-center mx-auto border border-gray-100">
          {lockMessage.icon}
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-3">{lockMessage.title}</h2>
        <p className="text-slate-500 mb-8 leading-relaxed px-4">
          {lockMessage.desc}
        </p>
        
        <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate('/student/dashboard')}>
                Kembali ke Dashboard
            </Button>
            {user.paymentStatus !== 'Paid' && (
                <Button onClick={() => navigate('/student/payment')}>Bayar Sekarang</Button>
            )}
        </div>
      </div>
    );
  }

  // --- TAMPILAN 3: KARTU UJIAN (SUDAH PILIH) ---
  if (mySchedule) {
    return (
      <div className="max-w-2xl mx-auto animate-in zoom-in duration-500">
         <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-center gap-3 mb-6 shadow-sm">
            <CheckCircle size={24} className="text-green-600" />
            <div>
                <p className="font-bold">Jadwal Terkonfirmasi</p>
                <p className="text-sm opacity-80">Anda berhak mengikuti ujian pada sesi ini.</p>
            </div>
         </div>

        {/* KARTU UJIAN UI */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 relative print:shadow-none print:border-2">
          {/* Header Kartu */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white flex justify-between items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <QrCode size={100} />
            </div>
            <div className="relative z-10">
                <h2 className="text-3xl font-black tracking-wide">KARTU PESERTA</h2>
                <p className="opacity-90 text-sm font-medium tracking-wider mt-1">UJIAN SARINGAN MASUK 2025</p>
            </div>
            <div className="text-right relative z-10">
                <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">NOMOR PESERTA</p>
                <p className="font-mono font-bold text-2xl tracking-widest">USM-{user.id.toString().toUpperCase()}</p>
            </div>
          </div>
          
          {/* Body Kartu */}
          <div className="p-8 flex flex-col md:flex-row gap-8 items-center bg-white">
            
            {/* FOTO USER ASLI (BASE64) */}
            <div className="flex flex-col items-center gap-4">
                <div className="w-36 h-44 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden border-4 border-white shadow-lg ring-1 ring-slate-200">
                   {/* LOGIKA FOTO: Tampilkan Documents.Foto atau Placeholder */}
                   <img 
                     src={user.documents?.foto || "https://placehold.co/300x400?text=No+Photo"} 
                     alt="Pas Foto" 
                     className="w-full h-full object-cover"
                   />
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                    <QrCode size={64} className="text-slate-800" />
                </div>
            </div>

            <div className="text-left flex-1 space-y-5 w-full">
                <div className="border-b border-slate-100 pb-4">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Nama Peserta</p>
                    <p className="font-bold text-2xl text-slate-800">{user.fullName}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Program Studi Pilihan</p>
                    <p className="font-bold text-lg text-slate-700">{user.major}</p>
                </div>
                
                {/* Kotak Waktu */}
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                         <Calendar size={24}/>
                    </div>
                    <div>
                        <p className="text-xs text-blue-600 font-bold uppercase">Waktu Ujian</p>
                        <p className="font-black text-slate-800 text-lg">
                            {mySchedule.date} <span className="mx-1 text-slate-300">|</span> {mySchedule.time}
                        </p>
                    </div>
                </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center">
            <Button onClick={() => window.print()} variant="outline" className="w-full md:w-auto shadow-sm">
                <Download size={18} className="mr-2"/> Cetak Kartu Peserta (PDF)
            </Button>
          </div>
        </div>
        
        <p className="text-center text-xs text-slate-400 mt-6">
            *Wajib membawa kartu ini dan kartu identitas asli saat pelaksanaan ujian.
        </p>
      </div>
    );
  }

  // --- TAMPILAN 4: PILIH JADWAL (TERBUKA KARENA SUDAH VERIFIED) ---
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 text-center md:text-left">
        <h2 className="text-3xl font-black text-slate-800">Pilih Jadwal Ujian</h2>
        <p className="text-slate-500 mt-2">Selamat! Berkas Anda telah disetujui. Silakan pilih sesi ujian yang tersedia di bawah ini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schedules.length === 0 ? (
            <div className="col-span-3 text-center p-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
                <Calendar size={48} className="mx-auto text-slate-300 mb-4"/>
                <h3 className="text-lg font-bold text-slate-600">Belum Ada Jadwal</h3>
                <p className="text-slate-400 text-sm">Admin belum membuat jadwal ujian. Silakan cek lagi nanti.</p>
            </div>
        ) : schedules.map((item) => {
            const isFull = item.filled >= item.quota;
            return (
                <div key={item.id} className={`group relative bg-white rounded-3xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
                    ${isFull ? 'border-slate-200 opacity-60 grayscale' : 'border-slate-200 hover:border-blue-400'}`}>
                    
                    {/* Header Card */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Tanggal</p>
                            <h3 className="text-xl font-black text-slate-800">{item.date}</h3>
                        </div>
                        <div className={`px-3 py-1 rounded-lg text-xs font-bold border
                            ${isFull ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                            {isFull ? 'PENUH' : 'BUKA'}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-6 text-slate-600 bg-slate-50 p-3 rounded-xl">
                        <Clock size={18} className="text-blue-500"/>
                        <span className="font-bold text-lg">{item.time}</span>
                        <span className="text-xs text-slate-400 ml-auto">WIB</span>
                    </div>
                    
                    {/* Progress Bar Kuota */}
                    <div className="mb-6">
                        <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                            <span>Ketersediaan Kursi</span>
                            <span className={isFull ? 'text-red-500' : 'text-blue-600'}>
                                {item.filled} / {item.quota}
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div 
                                className={`h-2 rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : 'bg-blue-600'}`} 
                                style={{ width: `${(item.filled/item.quota)*100}%` }}
                            ></div>
                        </div>
                    </div>

                    <Button 
                        onClick={() => handleSelect(item.id, item.filled)} 
                        disabled={isFull}
                        className={`w-full py-3 rounded-xl shadow-lg transition-all
                            ${isFull ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'}`}
                    >
                        {isFull ? 'Slot Penuh' : 'Pilih Sesi Ini'}
                    </Button>
                </div>
            )
        })}
      </div>
    </div>
  );
};

export default ExamSchedulePage;