import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { Users, FileCheck, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pendingVerif: 0,
    rejectedVerif: 0,
    accepted: 0,
    rejected: 0,
    pending: 0
  });

  const [majorData, setMajorData] = useState([]);
  const [statusData, setStatusData] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3006/users?role=student')
      .then(res => res.json())
      .then(data => {

        // Hitung specific status (Diterima / Ditolak)
        const accepted = data.filter(u => u.status === 'Diterima').length;
        const rejected = data.filter(u => u.status === 'Ditolak').length;
        const pending = data.length - accepted - rejected;

        // Hitung status verifikasi
        const verified = data.filter(u => u.verificationStatus === 'Verified').length;
        const pendingVerif = data.filter(u => !u.verificationStatus || u.verificationStatus === 'Pending').length;
        const rejectedVerif = data.filter(u => u.verificationStatus === 'Rejected').length;

        setStats({
          total: data.length,
          verified,
          pendingVerif,
          rejectedVerif,
          accepted,
          rejected,
          pending
        });

        // Grafik jurusan
        const majorCounts = data.reduce((acc, curr) => {
          acc[curr.major] = (acc[curr.major] || 0) + 1;
          return acc;
        }, {});

        setMajorData(
          Object.keys(majorCounts).map(key => ({
            name: key || 'Belum Pilih',
            jumlah: majorCounts[key]
          }))
        );

        // Pie chart verifikasi
        setStatusData([
          { name: 'Verified', value: verified },
          { name: 'Pending', value: pendingVerif },
          { name: 'Rejected', value: rejectedVerif }
        ]);
      });
  }, []);

  const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

  const StatCard = ({ title, value, icon: Icon, color, bg }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
      </div>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bg} ${color}`}>
        <Icon size={26} />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard PMB</h2>

      {/* GRID STATISTIK */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <StatCard 
          title="Total Pendaftar" 
          value={stats.total} 
          icon={Users} 
          color="text-blue-600" 
          bg="bg-blue-100" 
        />

        <StatCard 
          title="Diterima" 
          value={stats.accepted} 
          icon={CheckCircle} 
          color="text-green-600" 
          bg="bg-green-100" 
        />

        <StatCard 
          title="Ditolak" 
          value={stats.rejected} 
          icon={XCircle} 
          color="text-red-600" 
          bg="bg-red-100" 
        />

        <StatCard 
          title="Perlu Review" 
          value={stats.pending} 
          icon={Clock} 
          color="text-yellow-600" 
          bg="bg-yellow-100" 
        />
      </div>

      {/* STATISTIK VERIFIKASI BERKAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <StatCard 
          title="Sudah Diverifikasi" 
          value={stats.verified} 
          icon={FileCheck} 
          color="text-green-600" 
          bg="bg-green-100" 
        />

        <StatCard 
          title="Menunggu Verifikasi" 
          value={stats.pendingVerif} 
          icon={Clock} 
          color="text-yellow-600" 
          bg="bg-yellow-100" 
        />

        <StatCard 
          title="Verifikasi Ditolak" 
          value={stats.rejectedVerif} 
          icon={AlertTriangle} 
          color="text-red-600" 
          bg="bg-red-100" 
        />
      </div>

      {/* AREA GRAFIK */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* BAR CHART */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-bold text-gray-700 mb-4">Statistik Peminat Program Studi</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={majorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{fontSize: 12}} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="jumlah" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-bold text-gray-700 mb-4">Status Verifikasi Berkas</h3>
          <div className="h-64 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
