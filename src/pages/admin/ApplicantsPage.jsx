import React, { useEffect, useState } from 'react';
import StatusBadge from '../../components/ui/StatusBadge';
import { Search, Eye, Trash2, Check, X, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ApplicantsPage = () => {
  const [applicants, setApplicants] = useState([]);
  const [search, setSearch] = useState('');

  // 1. READ DATA
  const fetchApplicants = () => {
    fetch('http://localhost:3006/users?role=student')
      .then(res => res.json())
      .then(data => setApplicants(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  // 2. UPDATE STATUS
  const handleStatusChange = async (id, newStatus) => {
    const confirmMsg = newStatus === 'Diterima'
      ? "Terima mahasiswa ini?"
      : "Tolak mahasiswa ini?";

    if (!window.confirm(confirmMsg)) return;

    try {
      await fetch(`http://localhost:3006/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchApplicants();
    } catch (error) {
      alert("Gagal update status");
    }
  };

  // 3. DELETE DATA
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus data ini?")) return;

    try {
      await fetch(`http://localhost:3006/users/${id}`, { method: 'DELETE' });
      fetchApplicants();
    } catch (error) {
      alert("Gagal menghapus data");
    }
  };

  // 4. FILTER SEARCH
  const filteredData = applicants.filter(user => 
    user.fullName.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  // 5. EXPORT PDF
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Laporan Calon Mahasiswa Baru 2025", 14, 20);

    const tableColumn = ["ID", "Nama Lengkap", "Prodi", "Status", "Asal Sekolah"];
    const tableRows = [];

    applicants.forEach(user => {
      tableRows.push([
        user.id,
        user.fullName,
        user.major,
        user.status || "-",
        user.schoolOrigin || "-",
      ]);
    });

    doc.autoTable(tableColumn, tableRows, { startY: 30 });
    doc.save("Laporan_PMB_2025.pdf");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">

      {/* Header + Export PDF */}
      <div className="p-6 border-b flex flex-col md:flex-row justify-between items-center gap-4">
        <h3 className="text-lg font-bold text-gray-800">Data Calon Mahasiswa</h3>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama..." 
              className="pl-10 pr-4 py-2 border rounded-lg w-60 focus:ring-2 focus:ring-blue-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Export PDF button */}
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
          >
            <Printer size={18} /> Export PDF
          </button>
        </div>
      </div>

      {/* TABEL */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold">
            <tr>
              <th className="p-4 border-b">Nama Lengkap</th>
              <th className="p-4 border-b">Jurusan</th>
              <th className="p-4 border-b">Asal Sekolah</th>
              <th className="p-4 border-b">Status</th>
              <th className="p-4 border-b text-center">Aksi</th>
            </tr>
          </thead>

          <tbody className="text-sm">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">
                  Tidak ada data ditemukan.
                </td>
              </tr>
            ) : (
              filteredData.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 border-b">
                  
                  <td className="p-4 font-semibold text-gray-700">
                    {user.fullName} <br />
                    <span className="text-xs text-gray-500">{user.email}</span>
                  </td>

                  <td className="p-4">{user.major || "-"}</td>

                  <td className="p-4">
                    {user.schoolOrigin || "-"} <br />
                    <span className="text-xs text-gray-500">
                      Lulus: {user.gradYear || "-"}
                    </span>
                  </td>

                  <td className="p-4">
                    <StatusBadge status={user.status} />
                  </td>

                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">

                      {/* TERIMA */}
                      <button 
                        onClick={() => handleStatusChange(user.id, 'Diterima')}
                        className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200"
                      >
                        <Check size={16} />
                      </button>

                      {/* TOLAK */}
                      <button 
                        onClick={() => handleStatusChange(user.id, 'Ditolak')}
                        className="p-2 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200"
                      >
                        <X size={16} />
                      </button>

                      {/* HAPUS */}
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApplicantsPage;
