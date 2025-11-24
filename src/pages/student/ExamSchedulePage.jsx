import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, QrCode, Download, Clock, CheckCircle, Lock, FileSearch, XCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const ExamSchedulePage = () => {
  const navigate = useNavigate();
  // Ambil data user terbaru dari localStorage
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [schedules, setSchedules] = useState([]);
  const [mySchedule, setMySchedule] = useState(null);
  
  // STATE UNTUK PENGECEKAN AKSES
  const [accessStatus, setAccessStatus] = useState('checking'); // checking | locked | granted
  const [lockMessage, setLockMessage] = useState({ title: '', desc: '', icon: null });

  useEffect(() => {
    checkPermission();
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

    // 4. JIKA LOLOS SEMUA -> AMBIL DATA JADWAL
    try {
      const res = await fetch('http://localhost:3033/schedules');
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
    }
  };

  const handleSelect = async (scheduleId, currentFilled) => {
    if(!window.confirm("Yakin pilih jadwal ini?")) return;

    // Update Server
    await fetch(`http://localhost:3033/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduleId: scheduleId, registrationStep: 4 })
    });
    await fetch(`http://localhost:3033/schedules/${scheduleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filled: currentFilled + 1 })
    });

    // Update Local
    const updatedUser = { ...user, scheduleId, registrationStep: 4 };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    
    alert("Jadwal Berhasil Dipilih!");
    window.location.reload();
  };

  // --- TAMPILAN 1: LOADING ---
  if (accessStatus === 'checking') {
    return <div className="p-10 text-center text-gray-500">Memeriksa status kelulusan berkas...</div>;
  }

  // --- TAMPILAN 2: TERKUNCI (LOCKED STATE) ---
  if (accessStatus === 'locked') {
    return (
      <div className="max-w-xl mx-auto mt-8 bg-white border border-gray-200 rounded-xl shadow-sm p-10 text-center">
        <div className="mb-4 flex justify-center bg-gray-50 w-20 h-20 rounded-full items-center mx-auto">
          {lockMessage.icon}
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{lockMessage.title}</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
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
      <div className="max-w-2xl mx-auto">
         <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg flex items-center gap-3 mb-6">
            <CheckCircle size={24} />
            <div>
                <p className="font-bold">Jadwal Terkonfirmasi</p>
                <p className="text-sm">Anda berhak mengikuti ujian pada sesi ini.</p>
            </div>
         </div>

        {/* KARTU UJIAN UI */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold tracking-wide">KARTU PESERTA</h2>
                <p className="opacity-80 text-sm">Ujian Saringan Masuk 2025</p>
            </div>
            <div className="text-right">
                <p className="text-xs opacity-70">NOMOR PESERTA</p>
                <p className="font-mono font-bold text-lg">USM-{user.id.toUpperCase()}</p>
            </div>
          </div>
          
          <div className="p-8 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-40 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border">
                    <img src={user.documents?.foto || "https://placehold.co/150"} alt="Foto" className="w-full h-full object-cover"/>
                </div>
                <QrCode size={80} className="text-gray-800" />
            </div>
            <div className="text-left flex-1 space-y-4">
                <div>
                    <p className="text-xs text-gray-400 uppercase">Nama Peserta</p>
                    <p className="font-bold text-xl text-gray-800">{user.fullName}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400 uppercase">Prodi Pilihan</p>
                    <p className="font-bold text-gray-800">{user.major}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <p className="font-bold text-blue-800 flex items-center gap-2">
                        <Calendar size={18}/> {mySchedule.date} • {mySchedule.time}
                    </p>
                </div>
            </div>
          </div>
          <div className="p-4 bg-gray-50 border-t flex justify-center">
            <Button onClick={() => window.print()} variant="outline"><Download size={18} className="mr-2"/> Cetak Kartu</Button>
          </div>
        </div>
      </div>
    );
  }

  // --- TAMPILAN 4: PILIH JADWAL (TERBUKA KARENA SUDAH VERIFIED) ---
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Pilih Jadwal Ujian</h2>
        <p className="text-gray-500">Selamat! Berkas Anda telah disetujui. Silakan pilih jadwal.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schedules.length === 0 ? (
            <div className="col-span-3 text-center p-10 bg-gray-50 border border-dashed rounded-xl">
                <p>Belum ada jadwal tersedia dari Admin.</p>
            </div>
        ) : schedules.map((item) => {
            const isFull = item.filled >= item.quota;
            return (
                <div key={item.id} className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition ${isFull ? 'opacity-50' : 'border-t-4 border-t-blue-500'}`}>
                    <h3 className="text-xl font-bold text-gray-800">{item.date}</h3>
                    <p className="text-blue-600 font-semibold mb-4 flex items-center gap-2"><Clock size={16}/> {item.time}</p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{width: `${(item.filled/item.quota)*100}%`}}></div>
                    </div>
                    <Button onClick={() => handleSelect(item.id, item.filled)} disabled={isFull} className="w-full" variant={isFull ? 'danger' : 'primary'}>
                        {isFull ? 'Penuh' : 'Pilih Sesi Ini'}
                    </Button>
                </div>
            )
        })}
      </div>
    </div>
  );
};

export default ExamSchedulePage;