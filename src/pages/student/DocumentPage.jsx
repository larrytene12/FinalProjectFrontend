import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, Trash, Image as ImageIcon, AlertCircle } from 'lucide-react';
import Button from '../../components/ui/Button';

const DocumentPage = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [uploading, setUploading] = useState({ ijazah: false, foto: false });
  
  // Refs untuk trigger input file tersembunyi
  const ijazahInputRef = useRef(null);
  const fotoInputRef = useRef(null);

  // --- FUNGSI AJAIB: KONVERSI GAMBAR KE TEXT (BASE64) ---
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => resolve(fileReader.result);
      fileReader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validasi ukuran (max 2MB biar db.json gak meledak)
    if (file.size > 2000000) {
        alert("Ukuran file terlalu besar! Maksimal 2MB.");
        return;
    }

    setUploading({ ...uploading, [type]: true });

    try {
        // 1. Convert ke Base64
        const base64Image = await convertToBase64(file);

        // 2. Siapkan Data Dokumen Baru
        const newDocuments = { 
            ...user.documents, 
            [type]: base64Image // Simpan string gambar
        };

        // 3. Simpan ke Database
        await fetch(`http://localhost:3033/users/${user.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                documents: newDocuments,
                // Jika kedua dokumen sudah ada, otomatis naik step
                registrationStep: (newDocuments.ijazah && newDocuments.foto) ? 3 : user.registrationStep
            })
        });

        // 4. Update Local Storage
        const updatedUser = { ...user, documents: newDocuments };
        if (newDocuments.ijazah && newDocuments.foto) updatedUser.registrationStep = 3;
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        alert(`Berhasil mengupload ${type === 'foto' ? 'Pas Foto' : 'Ijazah'}!`);

    } catch (error) {
        alert("Gagal upload gambar.");
        console.error(error);
    } finally {
        setUploading({ ...uploading, [type]: false });
    }
  };

  const handleDelete = async (type) => {
     if(!window.confirm("Hapus dokumen ini?")) return;
     
     const newDocs = { ...user.documents, [type]: null }; // Set null
     
     await fetch(`http://localhost:3033/users/${user.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documents: newDocs })
     });

     const updatedUser = { ...user, documents: newDocs };
     localStorage.setItem('user', JSON.stringify(updatedUser));
     setUser(updatedUser);
  };

  // Komponen Card Upload
  const UploadCard = ({ title, type, fileUrl, inputRef }) => (
    <div className="group relative border-2 border-dashed border-slate-300 rounded-[2rem] p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-blue-50 transition-all duration-300 hover:border-blue-400">
      
      {/* Input File Tersembunyi */}
      <input 
        type="file" 
        ref={inputRef} 
        className="hidden" 
        accept="image/*"
        onChange={(e) => handleFileChange(e, type)}
      />

      <div className={`p-4 rounded-2xl shadow-sm mb-4 transition-transform group-hover:scale-110 ${fileUrl ? 'bg-green-100 text-green-600' : 'bg-white text-blue-500'}`}>
        {fileUrl ? <CheckCircle size={32} /> : type === 'foto' ? <ImageIcon size={32} /> : <FileText size={32} />}
      </div>
      
      <h3 className="font-bold text-slate-700 mb-2 text-lg">{title}</h3>
      
      {fileUrl ? (
        <div className="text-center w-full">
            {/* PREVIEW GAMBAR ASLI */}
            <div className="w-32 h-32 mx-auto mb-4 rounded-xl overflow-hidden border-4 border-white shadow-lg">
                <img src={fileUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <button onClick={() => handleDelete(type)} className="text-red-500 text-sm font-bold hover:underline flex items-center justify-center gap-1 mx-auto">
                <Trash size={14}/> Hapus & Upload Ulang
            </button>
        </div>
      ) : (
        <div className="w-full text-center">
            <p className="text-xs text-slate-400 mb-6">Format JPG/PNG Max 2MB</p>
            <Button 
                onClick={() => inputRef.current.click()} // Trigger input file
                isLoading={uploading[type]} 
                variant="outline"
                className="mx-auto shadow-sm hover:shadow-md"
            >
                <UploadCloud size={18} className="mr-2" /> Pilih File
            </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="glass-panel rounded-[2.5rem] p-10 shadow-xl animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-800">Upload Berkas</h2>
        <p className="text-slate-500 mt-1">Unggah dokumen asli untuk keperluan verifikasi dan kartu ujian.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <UploadCard 
            title="Ijazah / SKL Terakhir" 
            type="ijazah" 
            fileUrl={user.documents?.ijazah} 
            inputRef={ijazahInputRef}
        />
        <UploadCard 
            title="Pas Foto Warna (Formal)" 
            type="foto" 
            fileUrl={user.documents?.foto} 
            inputRef={fotoInputRef}
        />
      </div>
      
      <div className="mt-8 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl text-sm text-blue-800 flex items-start gap-3">
        <AlertCircle size={20} className="shrink-0 mt-0.5"/> 
        <div>
            <strong>Penting:</strong> Pastikan Pas Foto wajah terlihat jelas dan menggunakan pakaian formal. 
            Foto ini akan dicetak otomatis pada <strong>Kartu Ujian</strong> Anda.
        </div>
      </div>
    </div>
  );
};

export default DocumentPage;