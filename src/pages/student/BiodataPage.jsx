import React, { useState, useEffect } from 'react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Save } from 'lucide-react';

const BiodataPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null); 
  
  // State Form
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    schoolOrigin: '',
    gradYear: '',
    major: 'Teknik Informatika' 
  });


  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);

      fetch(`http://localhost:3033/users/${storedUser.id}`)
        .then(res => res.json())
        .then(data => {
            setFormData({
                fullName: data.fullName || '',
                phone: data.phone || '',
                address: data.address || '',
                schoolOrigin: data.schoolOrigin || '',
                gradYear: data.gradYear || '',
                major: data.major || 'Teknik Informatika'
            });
        });
    }
  }, []);

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update ke JSON Server
      const response = await fetch(`http://localhost:3033/users/${user.id}`, {
        method: 'PATCH', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          registrationStep: 2 
        })
      });

      const updatedUser = await response.json();

      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      alert("Data Berhasil Disimpan!");
      
      
      window.location.reload(); 

    } catch (error) {
      console.error("Gagal simpan:", error);
      alert("Gagal menyimpan data.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border">
      <div className="mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Lengkapi Biodata</h2>
        <p className="text-gray-500">Data ini akan digunakan untuk verifikasi berkas.</p>
      </div>

      <form onSubmit={handleSubmit}>
        
        <h3 className="text-lg font-semibold text-blue-600 mb-4">Data Pribadi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
                label="Nama Lengkap" 
                value={formData.fullName} 
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                required
            />
            <Input 
                label="Nomor HP / WA" 
                type="number"
                placeholder="0812..."
                value={formData.phone} 
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
            />
        </div>
        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Alamat Lengkap</label>
            <textarea 
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
                rows="3"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                required
            ></textarea>
        </div>

        
        <h3 className="text-lg font-semibold text-blue-600 mb-4 mt-6">Data Sekolah</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
                label="Asal Sekolah" 
                placeholder="SMA N 1..."
                value={formData.schoolOrigin} 
                onChange={(e) => setFormData({...formData, schoolOrigin: e.target.value})}
                required
            />
            <Input 
                label="Tahun Lulus" 
                type="number"
                placeholder="2024"
                value={formData.gradYear} 
                onChange={(e) => setFormData({...formData, gradYear: e.target.value})}
                required
            />
        </div>

       
        <h3 className="text-lg font-semibold text-blue-600 mb-4 mt-6">Pilihan Program Studi</h3>
        <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Jurusan Pilihan</label>
            <select 
                className="w-full px-4 py-2 border rounded-lg bg-white"
                value={formData.major}
                onChange={(e) => setFormData({...formData, major: e.target.value})}
            >
                <option value="Teknik Informatika">Teknik Informatika</option>
                <option value="Sistem Informasi">Sistem Informasi</option>
                <option value="DKV">Desain Komunikasi Visual</option>
                <option value="Akuntansi">Akuntansi</option>
            </select>
        </div>

        <div className="flex justify-end mt-8">
            <div className="w-40">
                <Button type="submit" isLoading={isLoading}>
                    <Save size={18} className="mr-2" /> Simpan Data
                </Button>
            </div>
        </div>
      </form>
    </div>
  );
};

export default BiodataPage;