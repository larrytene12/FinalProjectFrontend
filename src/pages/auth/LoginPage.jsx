import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userRes = await fetch(`http://localhost:3001/users?email=${email}&password=${password}`);
      const users = await userRes.json();

      if (users.length > 0) {
        const student = users[0];
        localStorage.setItem('isAuth', 'true');
        localStorage.setItem('role', 'student');
        localStorage.setItem('user', JSON.stringify(student)); 
        
        alert(`Selamat datang, ${student.fullName}!`);
        navigate('/student/dashboard');
        return;
      }

      const adminRes = await fetch(`http://localhost:3001/admins?email=${email}&password=${password}`);
      const admins = await adminRes.json();

      if (admins.length > 0) {
        const admin = admins[0];
        localStorage.setItem('isAuth', 'true');
        localStorage.setItem('role', 'admin');
        localStorage.setItem('user', JSON.stringify(admin));

        alert(`Login Admin Berhasil: ${admin.fullName}`);
        navigate('/admin/dashboard');
        return;
      }

      alert("Email atau Password salah!");

    } catch (error) {
      console.error("Login Error:", error);
      alert("Gagal menghubungi server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center backdrop-blur-sm relative"
      style={{ backgroundImage: `url(${APP_CONFIG.BG_IMAGE_URL})` }}
    >
      {/* Overlay gelap */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      <div className="relative z-10 flex w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden m-4 min-h-[600px]">
        
        {/* --- BAGIAN KIRI (BACKGROUND IMAGE) --- */}
        <div 
          className="hidden md:flex w-1/2 bg-cover bg-center items-center justify-center p-8 relative 
          after:content-[''] after:absolute after:inset-0 after:bg-blue-900/60 after:z-0"
          style={{ backgroundImage: `url(${APP_CONFIG.BG_IMAGE_URL})` }}
        >
          <div className="relative z-10 flex flex-col items-center text-white text-center">
            <img 
              src={APP_CONFIG.LOGO_URL} 
              alt="Logo Kampus" 
              className="w-28 h-auto mb-6 drop-shadow-lg object-contain"
            />
            <h2 className="text-3xl font-bold mb-2 drop-shadow-md">{APP_CONFIG.NAME}</h2>
            <p className="opacity-90 drop-shadow-sm font-light">Sistem Penerimaan Mahasiswa Baru Online</p>
          </div>
        </div>

        {/* --- BAGIAN KANAN (FORM LOGIN) --- */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="text-left mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Selamat Datang</h2>
            <p className="text-gray-500">Silakan login untuk mengakses akun Anda.</p>
          </div>

          <form onSubmit={handleLogin}>
            <Input 
              label="Email" 
              type="email" 
              placeholder="Masukkan email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input 
              label="Password" 
              type="password" 
              placeholder="Masukkan password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="mt-8">
              <Button type="submit" isLoading={isLoading}>
                <LogIn size={18} className="mr-2" /> Masuk Aplikasi
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Belum punya akun mahasiswa? <br />
              <Link to="/register" className="text-blue-600 font-bold hover:underline text-base">
                Daftar Akun Baru
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
