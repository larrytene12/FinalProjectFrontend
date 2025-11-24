import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, CheckCircle, Trash } from 'lucide-react';
import Button from '../../components/ui/Button';

const DocumentPage = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [uploading, setUploading] = useState({ ijazah: false, foto: false });
  

  const [docs, setDocs] = useState(user.documents || { ijazah: null, foto: null });

  const handleUpload = (type) => {
    // Simulasi Loading Upload
    setUploading({ ...uploading, [type]: true });

    setTimeout(async () => {
      // 1. Buat Fake URL
      const fakeUrl = `https://storage.kampus.id/${user.id}/${type}.jpg`;
      
      // 2. Update State Lokal
      const newDocs = { ...docs, [type]: fakeUrl };
      setDocs(newDocs);

      // 3. Update ke Database (PATCH)
      try {
        await fetch(`http://localhost:3033/users/${user.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            documents: newDocs,
            registrationStep: 3 // Naik ke step 3
          })
        });

        // Update LocalStorage
        const updatedUser = { ...user, documents: newDocs, registrationStep: 3 };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        alert(`Berhasil upload ${type}!`);
      } catch (error) {
        alert("Gagal upload.");
      } finally {
        setUploading({ ...uploading, [type]: false });
      }
    }, 2000); 
  };

  const handleDelete = async (type) => {
     if(!window.confirm("Hapus dokumen ini?")) return;
   
     const newDocs = { ...docs, [type]: null };
     setDocs(newDocs);
     // ... (Update DB code here - disingkat biar ringkas)
  };

  // Komponen Card Upload Kecil
  const UploadCard = ({ title, type, fileUrl }) => (
    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50 transition">
      <div className="bg-white p-4 rounded-full shadow-sm mb-4">
        {fileUrl ? <CheckCircle className="text-green-500" size={32} /> : <FileText className="text-blue-500" size={32} />}
      </div>
      <h3 className="font-bold text-gray-700 mb-2">{title}</h3>
      
      {fileUrl ? (
        <div className="text-center">
            <p className="text-xs text-green-600 font-bold mb-4">Sudah Diupload</p>
            <button onClick={() => handleDelete(type)} className="text-red-500 text-xs hover:underline flex items-center justify-center gap-1">
                <Trash size={12}/> Hapus File
            </button>
        </div>
      ) : (
        <div className="w-full">
            <p className="text-xs text-gray-400 mb-4 text-center">Format JPG/PDF Max 2MB</p>
            <Button 
                onClick={() => handleUpload(type)} 
                isLoading={uploading[type]} 
                variant="outline"
            >
                <UploadCloud size={18} className="mr-2" /> Pilih File
            </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Upload Berkas</h2>
        <p className="text-gray-500">Lengkapi dokumen persyaratan pendaftaran.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UploadCard title="Ijazah / SKL Terakhir" type="ijazah" fileUrl={docs.ijazah} />
        <UploadCard title="Pas Foto Warna (4x6)" type="foto" fileUrl={docs.foto} />
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg text-sm text-blue-800 flex items-center gap-2">
        <span>ℹ️</span> Pastikan dokumen terbaca jelas agar proses verifikasi admin berjalan lancar.
      </div>
    </div>
  );
};

export default DocumentPage;