import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { Users, FileCheck, Clock, AlertTriangle, CheckCircle, XCircle, BarChart2, RefreshCw, ServerCrash } from 'lucide-react';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [stats, setStats] = useState({
    total: 0, verified: 0, pendingVerif: 0, rejectedVerif: 0,
    accepted: 0, rejected: 0, pending: 0
  });

  const [majorData, setMajorData] = useState([]);
  const [statusData, setStatusData] = useState([]);

  // Fungsi Fetch Data terpisah agar bisa dipanggil ulang (Refresh)
  const loadData = () => {
    setLoading(true);
    setErrorMsg('');
    
    console.log("Memulai fetch data dari http://localhost:3033/users?role=student...");

    fetch('http://localhost:3033/users?role=student')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP Error! Status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log("Data diterima:", data);

        if (!Array.isArray(data)) {
          throw new Error("Format data salah (Bukan Array).");
        }

        // 1. Hitung Status Penerimaan
        const accepted = data.filter(u => ['diterima', 'lulus', 'accepted'].includes((u.status || '').toLowerCase())).length;
        const rejected = data.filter(u => ['ditolak', 'tidak lulus', 'rejected'].includes((u.status || '').toLowerCase())).length;
        const pending = data.length - accepted - rejected;

        // 2. Hitung Status Verifikasi
        const verified = data.filter(u => (u.verificationStatus || '').toLowerCase() === 'verified').length;
        const rejectedVerif = data.filter(u => (u.verificationStatus || '').toLowerCase() === 'rejected').length;
        const pendingVerif = data.length - verified - rejectedVerif;

        setStats({
          total: data.length,
          verified, pendingVerif, rejectedVerif,
          accepted, rejected, pending
        });

        // 3. Grafik Jurusan
        const majorCounts = data.reduce((acc, curr) => {
          const key = curr.major || 'Lainnya';
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});

        setMajorData(Object.keys(majorCounts).map(key => ({ name: key, jumlah: majorCounts[key] })));

        // 4. Pie Chart Data
        setStatusData([
          { name: 'Verified', value: verified },
          { name: 'Pending', value: pendingVerif },
          { name: 'Rejected', value: rejectedVerif }
        ]);
        
        setLoading(false);
      })
      .catch(err => {
        console.error("Gagal fetch:", err);
        // Deteksi jika error karena server mati (Failed to fetch)
        if (err.message === 'Failed to fetch') {
            setErrorMsg("KONEKSI TERPUTUS: Server Database Mati / Tidak Ditemukan.");
        } else {
            setErrorMsg(err.message);
        }
        setLoading(false);
      });
  };

  // Load saat pertama kali buka
  useEffect(() => {
    loadData();
  }, []);

  const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

  const StatCard = ({ title, value, icon: Icon, color, bg }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-black text-gray-800 mt-1">{loading ? "..." : value}</h3>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${color}`}>
        <Icon size={24} />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header & Controls */}
      <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Dashboard Statistik</h2>
            <p className="text-gray-500 mt-1">
              {loading ? "Sedang menghubungkan ke server..." : "Ringkasan data penerimaan mahasiswa baru."}
            </p>
          </div>
          <div className="flex gap-3">
             <button 
                onClick={loadData} 
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-lg disabled:opacity-50"
                disabled={loading}
             >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> {loading ? "Loading..." : "Refresh Data"}
             </button>
          </div>
      </div>

      {/* ERROR STATE: TAMPILAN JIKA SERVER MATI */}
      {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl shadow-sm animate-pulse">
              <div className="flex items-center gap-3 mb-2">
                  <ServerCrash className="text-red-600" size={32}/>
                  <h3 className="text-lg font-black text-red-700">GAGAL MENGHUBUNGI SERVER (Port 3033)</h3>
              </div>
              <p className="text-red-600 mb-4 ml-11">
                  Aplikasi tidak bisa membaca data. Kemungkinan terminal JSON Server tertutup atau belum dijalankan.
              </p>
              <div className="ml-11 bg-white p-4 rounded border border-red-200 shadow-inner">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">Solusi: Jalankan perintah ini di terminal baru</p>
                  <code className="font-mono text-sm bg-slate-900 text-green-400 px-3 py-2 rounded block w-fit">
                      npx json-server db.json --port 3033 --watch
                  </code>
              </div>
          </div>
      )}

      {/* KONTEN UTAMA (Hanya muncul jika tidak error) */}
      {!errorMsg && (
        <>
          {/* GRID STATISTIK UTAMA */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Pendaftar" value={stats.total} icon={Users} color="text-blue-600" bg="bg-blue-100" />
            <StatCard title="Lulus Seleksi" value={stats.accepted} icon={CheckCircle} color="text-green-600" bg="bg-green-100" />
            <StatCard title="Tidak Lulus" value={stats.rejected} icon={XCircle} color="text-red-600" bg="bg-red-100" />
            <StatCard title="Proses Seleksi" value={stats.pending} icon={Clock} color="text-yellow-600" bg="bg-yellow-100" />
          </div>

          {/* STATISTIK VERIFIKASI BERKAS */}
          <div>
            <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                <FileCheck size={20} className="text-purple-500"/> Status Verifikasi Dokumen
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Sudah Diverifikasi" value={stats.verified} icon={FileCheck} color="text-emerald-600" bg="bg-emerald-100" />
                <StatCard title="Menunggu Admin" value={stats.pendingVerif} icon={Clock} color="text-amber-600" bg="bg-amber-100" />
                <StatCard title="Berkas Ditolak" value={stats.rejectedVerif} icon={AlertTriangle} color="text-rose-600" bg="bg-rose-100" />
            </div>
          </div>

          {/* AREA GRAFIK */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* BAR CHART */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg">
              <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <BarChart2 size={20} className="text-blue-500"/> Statistik Peminat Prodi
              </h3>
              <div className="h-72 w-full">
                {majorData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={majorData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                        <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 11}} axisLine={false} tickLine={false} dy={10} />
                        <YAxis tick={{fill: '#64748b', fontSize: 11}} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0'}} />
                        <Bar dataKey="jumlah" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-400">Tidak ada data untuk grafik</div>
                )}
              </div>
            </div>

            {/* PIE CHART */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg">
              <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FileCheck size={20} className="text-purple-500"/> Proporsi Status Berkas
              </h3>
              <div className="h-72 w-full flex justify-center relative">
                {statusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                        >
                        {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                        </Pie>
                        <Tooltip contentStyle={{borderRadius: '8px'}} />
                        <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-400">Tidak ada data</div>
                )}
                
                {/* Total Center Text */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mt-[-20px]">
                    <p className="text-3xl font-black text-gray-800">{stats.total}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Total</p>
                </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;