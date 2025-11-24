import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';
import Button from '../../components/ui/Button';

const VerificationPage = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null); // Untuk data di Modal popup

  // 1. Ambil Data Student
  const fetchStudents = () => {
    fetch('http://localhost:3033/users?role=student')
      .then(res => res.json())
      .then(data => setStudents(data));
  };

  useEffect(() => { fetchStudents(); }, []);

  // 2. Fungsi Validasi (Update Status ke DB)
  const handleVerification = async (status) => {
    if (!selectedStudent) return;

    const newStatus = status === 'verified' ? 'Verified' : 'Rejected';
    
    // Update ke Server
    await fetch(`http://localhost:3033/users/${selectedStudent.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        verificationStatus: newStatus,
        // Jika verified, bisa lanjut step berikutnya (opsional)
      })
    });

    alert(`Status diubah menjadi: ${newStatus}`);
    setSelectedStudent(null); // Tutup Modal
    fetchStudents(); // Refresh Tabel
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Verifikasi Berkas Masuk</h2>

      {/* --- TABEL DAFTAR MAHASISWA --- */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm uppercase border-b">
              <th className="p-4">Nama Lengkap</th>
              <th className="p-4">Program Studi</th>
              <th className="p-4">Status Dokumen</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-b hover:bg-gray-50 text-sm">
                <td className="p-4 font-medium">{student.fullName}</td>
                <td className="p-4">{student.major}</td>
                <td className="p-4">
                  {/* Logic Status Warna-warni */}
                  <span className={`px-3 py-1 rounded-full text-xs font-bold 
                    ${student.verificationStatus === 'Verified' ? 'bg-green-100 text-green-700' : 
                      student.verificationStatus === 'Rejected' ? 'bg-red-100 text-red-700' : 
                      'bg-yellow-100 text-yellow-700'}`}>
                    {student.verificationStatus || 'Pending'}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button 
                    onClick={() => setSelectedStudent(student)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs flex items-center justify-center gap-2 mx-auto transition"
                  >
                    <Eye size={14} /> Periksa Berkas
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL / POPUP PEMERIKSAAN (PENTING!) --- */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
            
            {/* Header Modal */}
            <div className="bg-gray-100 p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">Periksa Dokumen: {selectedStudent.fullName}</h3>
              <button onClick={() => setSelectedStudent(null)} className="text-gray-500 hover:text-red-500">
                <XCircle size={24} />
              </button>
            </div>

            {/* Body Modal: Tampilan Dokumen */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Kolom 1: Ijazah */}
              <div className="border p-4 rounded-xl text-center bg-gray-50">
                <div className="mb-3 text-blue-600 flex justify-center">
                    <FileText size={40} />
                </div>
                <p className="font-bold text-gray-700 mb-2">Ijazah / SKL</p>
                
                {selectedStudent.documents?.ijazah ? (
                   <div className="space-y-2">
                     <p className="text-xs text-green-600 font-bold">✅ File Terlampir</p>
                     {/* Simulasi tombol lihat file */}
                     <a href={selectedStudent.documents.ijazah} target="_blank" rel="noreferrer" className="text-blue-500 text-xs underline">
                        Lihat File Asli
                     </a>
                   </div>
                ) : (
                   <p className="text-red-500 text-xs font-bold flex items-center justify-center gap-1">
                     <AlertCircle size={12}/> Belum Upload
                   </p>
                )}
              </div>

              {/* Kolom 2: Pas Foto */}
              <div className="border p-4 rounded-xl text-center bg-gray-50">
                <div className="mb-3 text-purple-600 flex justify-center">
                    <ImageIcon size={40} />
                </div>
                <p className="font-bold text-gray-700 mb-2">Pas Foto (4x6)</p>

                {selectedStudent.documents?.foto ? (
                   <div className="space-y-2">
                     <p className="text-xs text-green-600 font-bold">✅ File Terlampir</p>
                     <div className="w-20 h-24 bg-gray-300 mx-auto rounded overflow-hidden">
                        {/* Placeholder gambar karena fake URL */}
                        <img src="https://via.placeholder.com/150" alt="Preview" className="w-full h-full object-cover"/>
                     </div>
                   </div>
                ) : (
                   <p className="text-red-500 text-xs font-bold flex items-center justify-center gap-1">
                     <AlertCircle size={12}/> Belum Upload
                   </p>
                )}
              </div>

            </div>

            {/* Footer Modal: Tombol Validasi */}
            <div className="p-6 border-t bg-gray-50 flex gap-4 justify-end">
              <Button 
                variant="danger" 
                onClick={() => handleVerification('rejected')}
              >
                <XCircle size={18} className="mr-2"/> Tolak Berkas
              </Button>
              
              <Button 
                onClick={() => handleVerification('verified')}
                disabled={!selectedStudent.documents?.ijazah || !selectedStudent.documents?.foto} // Disable jika belum upload
              >
                <CheckCircle size={18} className="mr-2"/> Validasi & Terima
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default VerificationPage;