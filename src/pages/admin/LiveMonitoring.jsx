import React, { useState, useEffect } from 'react';
import { AlertTriangle, Ban, Signal, Eye, CheckCircle } from 'lucide-react';

const LiveMonitoring = () => {
  const [students, setStudents] = useState([]);

  // Simulasi Real-time Data Fetching
  useEffect(() => {
    const fetchData = async () => {
        try {
            // Ambil semua user yang role student
            const res = await fetch('http://localhost:3033/users?role=student');
            const data = await res.json();
            setStudents(data);
        } catch (error) {
            console.error("Error fetching monitoring data:", error);
        }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000); // Refresh tiap 2 detik (Live effect)
    return () => clearInterval(interval);
  }, []);

  const handleKick = async (id, name) => {
    if(window.confirm(`FORCE LOGOUT peserta ${name}? Tindakan ini tidak bisa dibatalkan.`)) {
        try {
            // Update status user jadi 'Diskualifikasi'
            await fetch(`http://localhost:3033/users/${id}`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ examStatus: 'Diskualifikasi', isOnline: false })
            });
            alert(`Peserta ${name} berhasil dikeluarkan dari ujian.`);
        } catch (error) {
            alert("Gagal melakukan aksi kick.");
        }
    }
  };

  // Dummy Video Feeds (Ganti dengan GIF loading atau gambar orang ujian biar realistis)
  const dummyCams = [
    "https://media.istockphoto.com/id/1325659228/video/young-businesswoman-having-video-call-in-office.jpg?s=640x640&k=20&c=2ZlQjEwZ6qW0jQx6q5W5q6qW5q6qW5q6qW5q6qW5q6q=", 
    "https://media.istockphoto.com/id/1304649637/video/young-man-having-video-call-at-home.jpg?s=640x640&k=20&c=2ZlQjEwZ6qW0jQx6q5W5q6qW5q6qW5q6qW5q6qW5q6q="
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-end">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 mb-1">Live Proctoring (CCTV)</h1>
                <p className="text-slate-500 text-sm">Memantau aktivitas peserta ujian secara real-time.</p>
            </div>
            <div className="flex gap-4">
                <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-center shadow-sm">
                    <p className="text-xs text-slate-500 uppercase font-bold">Online</p>
                    <p className="text-xl font-black text-green-500">{students.filter(s => s.examStatus === 'Sedang Ujian').length}</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-center shadow-sm">
                    <p className="text-xs text-slate-500 uppercase font-bold">Pelanggaran</p>
                    <p className="text-xl font-black text-red-500">{students.reduce((acc, curr) => acc + (curr.cheatCount || 0), 0)}</p>
                </div>
            </div>
        </div>

        {/* CCTV GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student, idx) => {
                const isCheating = (student.cheatCount || 0) > 0;
                const isDisqualified = student.examStatus === 'Diskualifikasi';
                
                // Simulasi gambar webcam (acak)
                const camSrc = idx < 2 ? dummyCams[idx] : `https://ui-avatars.com/api/?name=${student.fullName}&background=0f172a&color=fff&size=200`;

                return (
                    <div key={student.id} className={`relative bg-slate-900 rounded-xl overflow-hidden border-4 transition-all duration-300 shadow-xl
                        ${isDisqualified ? 'border-slate-700 opacity-50 grayscale' : 
                          isCheating ? 'border-red-500 shadow-red-500/50 scale-105 z-10' : 
                          'border-slate-800 hover:border-slate-600'}
                    `}>
                        
                        {/* Header Card */}
                        <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full border border-white/20 ${isDisqualified ? 'bg-gray-500' : 'bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]'}`}></div>
                                <span className="text-xs font-mono text-white shadow-sm bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">{student.fullName}</span>
                            </div>
                            <div className="bg-black/50 px-2 py-1 rounded text-[10px] font-mono text-white border border-white/20 backdrop-blur-sm">
                                CAM-{idx+1}
                            </div>
                        </div>

                        {/* Video Feed Area */}
                        <div className="aspect-video bg-black relative flex items-center justify-center group">
                            {/* Simulasi Video/Avatar */}
                            <img src={camSrc} alt="Cam" className="w-full h-full object-cover opacity-80" />
                            
                            {/* Overlay Stats */}
                            <div className="absolute bottom-3 left-3 text-xs font-mono text-white drop-shadow-md bg-black/40 px-2 py-1 rounded">
                                SCORE: <span className="text-green-400 font-bold">{student.examScore || 0}</span>
                            </div>

                            {/* Tombol Action (Muncul saat Hover) */}
                            {!isDisqualified && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                    <button 
                                        onClick={() => handleKick(student.id, student.fullName)}
                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg transform hover:scale-105 transition border border-red-400"
                                    >
                                        <Ban size={16}/> DISKUALIFIKASI
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Alert Footer */}
                        <div className={`p-3 flex justify-between items-center ${isCheating ? 'bg-red-900' : 'bg-slate-800'}`}>
                            {isDisqualified ? (
                                <span className="text-xs font-bold text-slate-500 flex items-center gap-1"><Ban size={12}/> USER BANNED</span>
                            ) : isCheating ? (
                                <div className="flex items-center gap-2 text-white animate-pulse font-bold text-xs">
                                    <AlertTriangle size={14} className="text-yellow-400"/> 
                                    CURANG TERDETEKSI ({student.cheatCount}x)
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                                    <CheckCircle size={14}/> AMAN
                                </div>
                            )}
                            
                            <div className="flex gap-1">
                                <div className="w-1 h-4 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]"></div>
                                <div className="w-1 h-3 bg-green-500 rounded-full"></div>
                                <div className="w-1 h-2 bg-green-500/30 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    </div>
  );
};

export default LiveMonitoring;