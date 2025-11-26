import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { APP_CONFIG } from '../../config';

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`http://localhost:3033/users?email=${email}&password=${password}`);
      const users = await res.json();

      if (users.length > 0) {
        const user = users[0];

        localStorage.setItem('isAuth', 'true');
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('role', user.role);

        if (user.role === 'admin') {
          alert(`Login Admin Berhasil: ${user.fullName}`);
          navigate('/admin/dashboard');
        } else {
          alert(`Selamat datang, ${user.fullName}!`);
          navigate('/student/dashboard');
        }
        return;
      }

      alert("Email atau Password salah!");
    } catch (error) {
      console.error("Login Error:", error);
      alert("Gagal menghubungi server database.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">

      {/* =====================================================
          SECTION 1 — HERO VIDEO FULLSCREEN (VIDEO PERTAMA)
      ====================================================== */}
      <section className="relative w-full h-screen overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          {/* VIDEO 1 */}
          <source src="/kampus-video.mp4 .mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-black/40"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center">
          <h1 className="text-5xl font-bold drop-shadow-lg">{APP_CONFIG.NAME}</h1>
          <p className="text-lg opacity-80 mt-4">Scroll ke bawah untuk login</p>

          <div className="mt-10 animate-bounce text-3xl opacity-70">▼</div>
        </div>
      </section>

      {/* =====================================================
          SECTION 2 — LOGIN WITH DIFFERENT VIDEO BACKGROUND
      ====================================================== */}
      <section className="relative w-full min-h-screen py-20 overflow-hidden">

        {/* VIDEO 2 */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/kampus-video.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

        <div className="relative z-10 w-full max-w-md mx-auto px-4">

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 mb-6">
              <img
                src={APP_CONFIG.LOGO_URL}
                alt="Logo"
                className="w-20 h-20 object-contain mx-auto"
              />
            </div>

            <h1 className="text-4xl font-bold text-white mb-2">{APP_CONFIG.NAME}</h1>

            <p className="text-white/90 font-light text-sm tracking-wide">
              Sistem Penerimaan Mahasiswa Baru Online
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-xl">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Selamat Datang</h2>
              <p className="text-white/80 text-sm">Silakan login ke akun Anda.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-white text-sm mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-white text-sm mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold shadow-lg hover:scale-105 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Memproses...</span>
                ) : (
                  <>
                    <LogIn size={20} />
                    <span>Masuk Aplikasi</span>
                  </>
                )}
              </button>
            </form>

            {/* Register */}
            <div className="mt-6 text-center pt-6 border-t border-white/20">
              <p className="text-white/80 text-sm">Belum punya akun?</p>

              <Link to="/register" className="text-white font-bold hover:underline">
                Daftar Akun Baru →
              </Link>
            </div>
          </div>

          <p className="text-center text-white/60 text-xs mt-6">
            © 2024 {APP_CONFIG.NAME}. All rights reserved.
          </p>
        </div>
      </section>

    </div>
  );
};

export default LoginPage;
