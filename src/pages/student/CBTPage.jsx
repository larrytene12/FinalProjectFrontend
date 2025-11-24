import React, { useState, useEffect, useRef } from 'react';
import { Clock, Lock, CheckCircle, ShieldAlert, Eye, AlertTriangle } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const CBTPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  
  // State Akses & Logika
  const [examStatus, setExamStatus] = useState('loading'); // loading | locked | open | finished
  const [lockReason, setLockReason] = useState('');
  const [scheduleDetail, setScheduleDetail] = useState(null);

  // State Soal & Jawaban
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);

  // --- STATE ANTI CURANG ---
  const [cheatCount, setCheatCount] = useState(0);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const videoRef = useRef(null);

  // 1. Initial Check & Anti-Right Click
  useEffect(() => {
    checkAccess();
    
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  // 2. Deteksi Pindah Tab (Anti-Cheat)
  useEffect(() => {
    if (examStatus === 'open') {
      const handleVisChange = () => {
        if (document.hidden) {
          handleCheatAttempt();
        }
      };
      document.addEventListener("visibilitychange", handleVisChange);
      return () => document.removeEventListener("visibilitychange", handleVisChange);
    }
  }, [examStatus, cheatCount]);

  // 3. Nyalakan Kamera
  useEffect(() => {
    if (examStatus === 'open') {
      startCamera();
    }
  }, [examStatus]);

  // --- FUNGSI LOGIKA UTAMA ---

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Peringatan: Kamera wajib aktif untuk pengawasan ujian!");
    }
  };

  const handleCheatAttempt = () => {
    const newCount = cheatCount + 1;
    setCheatCount(newCount);
    setIsWarningModalOpen(true);

    if (newCount >= 3) {
      finishExam(true); // Forced Finish (Diskualifikasi)
    }
  };

  // --- LOGIKA CEK AKSES (YANG ANDA MINTA) ---
  const checkAccess = async () => {
    // A. Cek Status User di Database
    if (user.examStatus === 'Selesai') return setExamStatus('finished');
    
    if (user.paymentStatus !== 'Paid') {
      setLockReason('Anda belum menyelesaikan pembayaran formulir.');
      return setExamStatus('locked');
    }
    if (user.verificationStatus !== 'Verified') {
      setLockReason('Berkas Anda belum disetujui Admin.');
      return setExamStatus('locked');
    }
    if (!user.scheduleId) {
      setLockReason('Anda belum memilih jadwal ujian.');
      return setExamStatus('locked');
    }

    try {
      // Ambil detail jadwal (untuk info saja)
      const res = await fetch(`http://localhost:3033/schedules/${user.scheduleId}`);
      const schedule = await res.json();
      setScheduleDetail(schedule);

 
      
      setTimeLeft(3600); // 60 Menit
      fetchQuestions();
      setExamStatus('open');

    } catch (error) {
      setLockReason('Gagal memuat data jadwal.');
      setExamStatus('locked');
    }
  };

  const fetchQuestions = () => {
    fetch('http://localhost:3033/questions')
      .then(res => res.json())
      .then(data => setQuestions(data));
  };

  // Timer Mundur
  useEffect(() => {
    if (examStatus === 'open' && timeLeft > 0) {
      const timerId = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerId);
            finishExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerId);
    }
  }, [examStatus, timeLeft]);

  // Submit Ujian
  const finishExam = async (forced = false) => {
    let score = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.answer) score += 20; 
    });

    if (forced) {
        alert("DISKUALIFIKASI: Sistem mendeteksi kecurangan berulang. Nilai Anda 0.");
        score = 0;
    }

    // Update Server
    await fetch(`http://localhost:3033/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ examScore: score, examStatus: 'Selesai' })
    });

    // Update Local Storage
    const updatedUser = { ...user, examScore: score, examStatus: 'Selesai' };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setExamStatus('finished');

    // Matikan Kamera
    if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
    }
  };

  // --- TAMPILAN (RENDER) ---

  // 1. JIKA TERKUNCI
  if (examStatus === 'locked') {
    return (
      <div className="glass-card max-w-xl mx-auto mt-20 p-10 text-center rounded-[2rem]">
        <Lock size={64} className="mx-auto text-red-500 mb-6" />
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Akses Ujian Terkunci</h2>
        <p className="text-gray-600 mb-8 text-lg">{lockReason}</p>
        <Button onClick={() => navigate('/student/dashboard')}>Kembali ke Dashboard</Button>
      </div>
    );
  }

  // 2. JIKA SELESAI
  if (examStatus === 'finished') {
    return (
      <div className="glass-card max-w-lg mx-auto mt-20 p-10 text-center rounded-[2rem] animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-green-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Ujian Selesai</h2>
        <p className="text-gray-500 mb-8">Jawaban Anda telah direkam sistem.</p>
        
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-2xl text-white mb-8 shadow-lg">
            <p className="text-sm font-medium opacity-80 uppercase tracking-widest">Skor Perolehan</p>
            <div className="text-6xl font-black mt-2">{user.examScore}</div>
        </div>
        
        <Button onClick={() => navigate('/student/dashboard')} className="w-full">Kembali ke Dashboard</Button>
      </div>
    );
  }

  if (questions.length === 0) return <div className="p-20 text-center text-white font-bold animate-pulse">Memuat Soal...</div>;

  // 3. TAMPILAN UJIAN UTAMA
  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] flex gap-6 select-none" onCopy={(e)=>e.preventDefault()}>
      
      {/* KIRI: AREA SOAL */}
      <div className="flex-1 glass-card rounded-[2rem] p-8 overflow-y-auto relative flex flex-col shadow-2xl">
        {/* Header Soal */}
        <div className="flex justify-between items-start mb-8 border-b border-gray-200 pb-6">
            <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <ShieldAlert className="text-purple-600"/> Ujian Potensi Akademik
                </h2>
                <p className="text-sm text-gray-500 mt-1">Soal nomor <span className="font-bold text-purple-600 text-lg">{currentQ + 1}</span> dari {questions.length}</p>
            </div>
            <div className={`flex items-center gap-3 px-5 py-2 rounded-full font-mono font-bold text-xl shadow-inner
                ${timeLeft < 300 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-700'}`}>
                <Clock size={20}/> 
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
        </div>

        {/* Isi Soal */}
        <div className="flex-1">
            <p className="text-xl font-medium text-gray-800 mb-8 leading-relaxed">
                {questions[currentQ].question}
            </p>
            <div className="space-y-4">
                {questions[currentQ].options.map((opt, idx) => (
                <button
                    key={idx}
                    onClick={() => setAnswers({...answers, [questions[currentQ].id]: opt})}
                    className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 group relative overflow-hidden
                    ${answers[questions[currentQ].id] === opt 
                    ? 'border-purple-600 bg-purple-50' 
                    : 'border-gray-100 hover:border-purple-300 hover:bg-white'}
                    `}
                >
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg mr-4 font-bold transition-colors
                        ${answers[questions[currentQ].id] === opt ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600 group-hover:bg-purple-200'}
                    `}>
                        {String.fromCharCode(65 + idx)}
                    </span>
                    <span className={`text-lg ${answers[questions[currentQ].id] === opt ? 'font-bold text-purple-700' : 'text-gray-700'}`}>{opt}</span>
                </button>
                ))}
            </div>
        </div>
        
        {/* Footer Navigasi */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
             <Button variant="outline" onClick={() => setCurrentQ(prev => Math.max(0, prev - 1))} disabled={currentQ === 0}>
                Kembali
             </Button>
             
             {currentQ === questions.length - 1 ? (
                <Button onClick={() => finishExam(false)} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-green-500/30">
                    Selesai & Kumpulkan
                </Button>
             ) : (
                <Button onClick={() => setCurrentQ(prev => Math.min(questions.length - 1, prev + 1))}>
                    Selanjutnya
                </Button>
             )}
        </div>
      </div>

      {/* KANAN: PANEL PROCTORING */}
      <div className="w-80 flex flex-col gap-6">
          
          {/* Kamera */}
          <div className="glass-card rounded-3xl p-4 shadow-lg border-2 border-red-500/30 relative overflow-hidden">
             <div className="absolute top-4 left-4 z-10 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded animate-pulse">
                🔴 REC
             </div>
             <div className="aspect-video bg-black rounded-xl overflow-hidden relative">
                <video ref={videoRef} autoPlay muted className="w-full h-full object-cover transform scale-x-[-1]"></video>
                <div className="absolute bottom-2 right-2 text-white/50 text-xs">System Proctoring AI</div>
             </div>
             <p className="text-center text-xs text-red-500 mt-2 font-bold flex items-center justify-center gap-1">
                <Eye size={12}/> Wajah Anda Sedang Dipantau
             </p>
          </div>

          {/* Navigasi Soal Grid */}
          <div className="glass-card rounded-3xl p-6 flex-1">
             <h3 className="font-bold text-gray-700 mb-4">Navigasi Soal</h3>
             <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => (
                    <button 
                        key={q.id}
                        onClick={() => setCurrentQ(idx)}
                        className={`aspect-square rounded-lg font-bold text-sm flex items-center justify-center transition-all
                        ${idx === currentQ ? 'ring-2 ring-purple-600 scale-110 z-10' : ''}
                        ${answers[q.id] ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/40' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}
                        `}
                    >
                        {idx + 1}
                    </button>
                ))}
            </div>
          </div>
      </div>

      {/* MODAL PERINGATAN CURANG */}
      {isWarningModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
             <div className="bg-white rounded-3xl p-8 max-w-md text-center shadow-2xl border-4 border-red-500 transform scale-100">
                <ShieldAlert size={80} className="text-red-500 mx-auto mb-4 animate-bounce"/>
                <h2 className="text-2xl font-black text-red-600 uppercase mb-2">Peringatan Kecurangan!</h2>
                <p className="text-gray-700 font-bold mb-4">
                    Sistem mendeteksi Anda mencoba meninggalkan halaman ujian (pindah tab/minimize).
                </p>
                <div className="bg-red-50 border border-red-200 p-4 rounded-xl mb-6">
                    <p className="text-red-800 font-bold text-lg">Pelanggaran {cheatCount} / 3</p>
                    <p className="text-xs text-red-600 mt-1">Jika mencapai 3x, Anda akan didiskualifikasi (Nilai 0).</p>
                </div>
                <Button onClick={() => setIsWarningModalOpen(false)} className="w-full bg-red-600 hover:bg-red-700">
                    Saya Mengerti & Kembali ke Ujian
                </Button>
             </div>
          </div>
      )}

    </div>
  );
};

export default CBTPage;