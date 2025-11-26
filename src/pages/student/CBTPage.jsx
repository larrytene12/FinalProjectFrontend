import React, { useState, useEffect, useRef } from 'react';
import { Clock, Lock, CheckCircle, ShieldAlert, Eye, RefreshCw, Ban } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const CBTPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  
  const [examStatus, setExamStatus] = useState('loading');
  const [lockReason, setLockReason] = useState('Memuat data terbaru...');
  
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);

  const [cheatCount, setCheatCount] = useState(0);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const videoRef = useRef(null);

  // 1. INITIAL LOAD & REFRESH DATA
  useEffect(() => {
    const initPage = async () => {
        await refreshUserDataAndCheck();
    };
    initPage();

    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  // --- FITUR BARU: LIVE STATUS CHECK (DETEKSI KICK/BAN DARI ADMIN) ---
  useEffect(() => {
    let interval;
    if (examStatus === 'open') {
      interval = setInterval(async () => {
        try {
          // Cek status terbaru di database
          const res = await fetch(`http://localhost:3033/users/${user.id}`);
          const freshUser = await res.json();
          
          // Jika Admin mengubah status jadi Diskualifikasi
          if (freshUser.examStatus === 'Diskualifikasi') {
            setUser(freshUser);
            localStorage.setItem('user', JSON.stringify(freshUser));
            setExamStatus('finished'); // Lempar ke tampilan finish
            
            // Matikan kamera paksa
            if (videoRef.current && videoRef.current.srcObject) {
              const tracks = videoRef.current.srcObject.getTracks();
              tracks.forEach(track => track.stop());
            }
            
            alert("PERINGATAN: Akses ujian Anda telah diputus oleh Pengawas!");
          }
        } catch (error) {
          console.error("Gagal cek status live", error);
        }
      }, 2000); // Cek setiap 2 detik
    }
    return () => clearInterval(interval);
  }, [examStatus, user.id]);

  const refreshUserDataAndCheck = async () => {
    try {
        const res = await fetch(`http://localhost:3033/users/${user.id}`);
        const freshUser = await res.json();
        setUser(freshUser);
        setCheatCount(freshUser.cheatCount || 0); 
        localStorage.setItem('user', JSON.stringify(freshUser));
        checkAccess(freshUser);
    } catch (error) {
        setLockReason("Gagal terhubung ke server.");
        setExamStatus('locked');
    }
  };

  const checkAccess = async (currentUser) => {
    if (currentUser.examStatus === 'Selesai' || currentUser.examStatus === 'Diskualifikasi') return setExamStatus('finished');
    
    if (currentUser.paymentStatus !== 'Paid') { setLockReason('Anda belum menyelesaikan pembayaran formulir.'); return setExamStatus('locked'); }
    if (currentUser.verificationStatus !== 'Verified') { setLockReason('Berkas Anda belum disetujui Admin.'); return setExamStatus('locked'); }
    if (!currentUser.scheduleId) { setLockReason('Anda belum memilih jadwal ujian.'); return setExamStatus('locked'); }

    try {
      await fetch(`http://localhost:3033/users/${currentUser.id}`, {
          method: 'PATCH',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ examStatus: 'Sedang Ujian', isOnline: true })
      });

      setTimeLeft(3600); 
      fetchQuestions();
      setExamStatus('open');
    } catch (error) {
      setLockReason('Gagal memuat ujian.');
      setExamStatus('locked');
    }
  };

  const fetchQuestions = () => {
    fetch('http://localhost:3033/questions').then(r=>r.json()).then(d=>setQuestions(d));
  };

  // 2. DETEKSI PINDAH TAB
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

  const handleCheatAttempt = async () => {
    const newCount = cheatCount + 1;
    setCheatCount(newCount);
    setIsWarningModalOpen(true);

    try {
        await fetch(`http://localhost:3033/users/${user.id}`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ cheatCount: newCount }) 
        });
    } catch (e) { console.error(e); }

    if (newCount >= 3) {
      finishExam(true); 
    }
  };

  // 3. KAMERA & TIMER
  useEffect(() => { if(examStatus === 'open') startCamera(); }, [examStatus]);
  
  useEffect(() => {
    if (examStatus === 'open' && timeLeft > 0) {
      const timerId = setInterval(() => setTimeLeft(p => {
          if(p<=1) { clearInterval(timerId); finishExam(); return 0; }
          return p-1;
      }), 1000);
      return () => clearInterval(timerId);
    }
  }, [examStatus, timeLeft]);

  const startCamera = async () => { 
      try { 
          const stream = await navigator.mediaDevices.getUserMedia({ video: true }); 
          if (videoRef.current) videoRef.current.srcObject = stream; 
      } catch (err) { } 
  };

  const finishExam = async (forced = false) => {
    let score = 0;
    questions.forEach(q => { if (answers[q.id] === q.answer) score += 20; });
    
    const finalStatus = forced ? 'Diskualifikasi' : 'Selesai';
    const finalScore = forced ? 0 : score;

    if(forced) alert("DISKUALIFIKASI: Sistem mendeteksi kecurangan berulang.");
    
    await fetch(`http://localhost:3032/users/${user.id}`, { 
        method: 'PATCH', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
            examScore: finalScore, 
            examStatus: finalStatus,
            isOnline: false 
        }) 
    });
    
    const updatedUser = { ...user, examScore: finalScore, examStatus: finalStatus };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setExamStatus('finished');

    if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
    }
  };

  // --- RENDER ---

  if (examStatus === 'loading') return <div className="p-20 text-center text-white font-bold animate-pulse">Memuat Ujian...</div>;
  
  if (examStatus === 'locked') {
    return (
      <div className="glass-card max-w-xl mx-auto mt-20 p-10 text-center rounded-[2rem]">
        <Lock size={64} className="mx-auto text-red-500 mb-6"/>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Terkunci</h2>
        <p className="text-gray-600 mb-8">{lockReason}</p>
        <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate('/student/dashboard')}>Kembali</Button>
            <Button onClick={refreshUserDataAndCheck} variant="outline"><RefreshCw size={18} className="mr-2"/> Cek Lagi</Button>
        </div>
      </div>
    );
  }

  // --- TAMPILAN JIKA SELESAI / BANNED ---
  if (examStatus === 'finished') {
    // A. JIKA KENA BANNED (DISKUALIFIKASI)
    if (user.examStatus === 'Diskualifikasi') {
        return (
            <div className="glass-card max-w-lg mx-auto mt-20 p-10 text-center rounded-[2rem] border-4 border-red-500 bg-red-50 shadow-[0_0_50px_rgba(239,68,68,0.5)] animate-in zoom-in duration-300">
                <Ban size={80} className="mx-auto text-red-600 mb-6 animate-pulse"/>
                <h2 className="text-4xl font-black text-red-700 mb-2">DISKUALIFIKASI</h2>
                <p className="text-red-800 font-bold text-lg mb-8">
                    Akses ujian Anda telah dicabut oleh Pengawas karena pelanggaran.
                </p>
                <div className="bg-white p-4 rounded-xl border border-red-200 text-red-500 font-mono text-sm mb-6 shadow-inner">
                    CODE: ADMIN_FORCE_KICK
                </div>
                <Button onClick={() => navigate('/student/dashboard')} className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30">
                    Kembali ke Dashboard
                </Button>
            </div>
        );
    }

    // B. JIKA SELESAI NORMAL
    return (
      <div className="glass-card max-w-lg mx-auto mt-20 p-10 text-center rounded-[2rem]">
        <CheckCircle size={64} className="mx-auto text-green-500 mb-6"/>
        <h2 className="text-3xl font-bold">Ujian Selesai</h2>
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-2xl text-white mt-6">
            <div className="text-6xl font-black">{user.examScore}</div>
            <p className="text-sm mt-2 opacity-80">Nilai telah disimpan</p>
        </div>
        <Button onClick={() => navigate('/student/dashboard')} className="mt-6 w-full">Dashboard</Button>
      </div>
    );
  }

  if (questions.length === 0) return <div className="text-center p-20 text-white">Loading Soal...</div>;

  // --- TAMPILAN UJIAN ---
  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] flex gap-6 select-none" onCopy={(e)=>e.preventDefault()}>
      <div className="flex-1 glass-card rounded-[2rem] p-8 overflow-y-auto relative flex flex-col shadow-2xl">
        <div className="flex justify-between border-b pb-6 mb-6">
            <div><h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><ShieldAlert className="text-purple-600"/> Ujian Potensi Akademik</h2><p className="text-sm text-gray-500 mt-1">Soal nomor <span className="font-bold text-purple-600 text-lg">{currentQ+1}</span> dari {questions.length}</p></div>
            <div className={`flex items-center gap-3 px-5 py-2 rounded-full font-mono font-bold text-xl shadow-inner ${timeLeft < 300 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-700'}`}><Clock size={20}/> {Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2, '0')}</div>
        </div>
        <div className="flex-1"><p className="text-xl font-medium text-gray-800 mb-8 leading-relaxed">{questions[currentQ].question}</p><div className="space-y-4">{questions[currentQ].options.map((opt, i) => (<button key={i} onClick={() => setAnswers({...answers, [questions[currentQ].id]: opt})} className={`w-full text-left p-5 rounded-xl border-2 transition-all ${answers[questions[currentQ].id] === opt ? 'border-purple-600 bg-purple-50' : 'hover:bg-white'}`}>{opt}</button>))}</div></div>
        <div className="flex justify-between mt-8 pt-6 border-t"><Button variant="outline" onClick={() => setCurrentQ(Math.max(0, currentQ-1))}>Kembali</Button>{currentQ === questions.length-1 ? <Button onClick={() => finishExam(false)}>Selesai</Button> : <Button onClick={() => setCurrentQ(Math.min(questions.length-1, currentQ+1))}>Lanjut</Button>}</div>
      </div>
      <div className="w-80 flex flex-col gap-6">
          <div className="glass-card rounded-3xl p-4 border-2 border-red-500/30 relative"><div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] px-2 rounded animate-pulse">REC</div><div className="aspect-video bg-black rounded-xl overflow-hidden"><video ref={videoRef} autoPlay muted className="w-full h-full object-cover transform scale-x-[-1]"></video></div><p className="text-center text-xs text-red-500 mt-2 font-bold"><Eye size={12} className="inline"/> Dipantau AI</p></div>
          <div className="glass-card rounded-3xl p-6 flex-1"><h3 className="font-bold mb-4">Navigasi</h3><div className="grid grid-cols-5 gap-2">{questions.map((q, i) => (<button key={q.id} onClick={() => setCurrentQ(i)} className={`aspect-square rounded-lg font-bold text-sm ${i === currentQ ? 'ring-2 ring-purple-600' : ''} ${answers[q.id] ? 'bg-purple-600 text-white' : 'bg-gray-100'}`}>{i+1}</button>))}</div></div>
      </div>
      {isWarningModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"><div className="bg-white rounded-3xl p-8 max-w-md text-center border-4 border-red-600"><ShieldAlert size={80} className="text-red-600 mx-auto mb-4"/><h2 className="text-2xl font-black text-red-600">JANGAN CURANG!</h2><p className="font-bold mb-6">Dilarang pindah tab. Pelanggaran {cheatCount}/3.</p><Button onClick={() => setIsWarningModalOpen(false)} className="w-full bg-red-600">Kembali Ujian</Button></div></div>}
    </div>
  );
};
export default CBTPage;