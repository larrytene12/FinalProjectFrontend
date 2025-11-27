import React, { useState } from 'react';
import { CreditCard, CheckCircle, Copy, Smartphone } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const PaymentPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState('bca');

  // Simulasi Virtual Account
  const vaNumber = `8800${user.id.padStart(8, '0')}`; 

  const handlePayment = () => {
    setLoading(true);
    
    // Simulasi proses bank (3 detik)
    setTimeout(async () => {
      // Update Backend
      await fetch(`http://localhost:3033/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'Paid', registrationStep: 2 })
      });

      // Update Local
      const updatedUser = { ...user, paymentStatus: 'Paid', registrationStep: 2 };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setLoading(false);
      
      alert('Pembayaran Berhasil! Silakan lanjut upload berkas.');
      navigate('/student/documents'); // Redirect otomatis
    }, 3000);
  };

  if (user.paymentStatus === 'Paid') {
    return (
      <div className="text-center p-10 bg-green-50 rounded-xl border border-green-200">
        <CheckCircle size={64} className="text-green-600 mx-auto mb-4"/>
        <h2 className="text-2xl font-bold text-green-800">Pembayaran Lunas</h2>
        <p className="text-green-700">Anda sudah membeli formulir pendaftaran.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <CreditCard className="text-blue-600"/> Pembayaran Formulir
      </h2>

      <div className="bg-blue-50 p-6 rounded-lg mb-6 border border-blue-100">
        <p className="text-sm text-blue-600 mb-1">Total Tagihan</p>
        <h3 className="text-3xl font-bold text-blue-900">Rp 350.000</h3>
        <p className="text-xs text-gray-500 mt-2">*Biaya pendaftaran tidak dapat dikembalikan</p>
      </div>

      <div className="mb-6">
        <label className="block font-bold mb-3">Pilih Metode Pembayaran</label>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => setMethod('bca')} className={`p-4 border rounded-lg flex items-center gap-3 ${method === 'bca' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : ''}`}>
            <div className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center text-white text-xs font-bold">BCA</div>
            <span className="font-semibold">Virtual Account</span>
          </button>
          <button onClick={() => setMethod('gopay')} className={`p-4 border rounded-lg flex items-center gap-3 ${method === 'gopay' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : ''}`}>
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white"><Smartphone size={20}/></div>
            <span className="font-semibold">QRIS / E-Wallet</span>
          </button>
        </div>
      </div>

      <div className="border-t pt-6">
        <p className="text-sm text-gray-500 mb-2">Nomor Virtual Account:</p>
        <div className="flex justify-between items-center bg-gray-100 p-3 rounded-lg mb-6">
          <span className="font-mono text-lg font-bold tracking-wider">{vaNumber}</span>
          <button className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline">
            <Copy size={14}/> Salin
          </button>
        </div>
        
        <Button onClick={handlePayment} isLoading={loading} className="w-full h-12 text-lg">
          {loading ? 'Memproses Pembayaran...' : 'Bayar Sekarang'}
        </Button>
      </div>
    </div>
  );
};
export default PaymentPage;