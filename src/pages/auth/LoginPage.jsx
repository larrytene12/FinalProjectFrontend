import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(
        `http://localhost:3033/users?email=${email}&password=${password}`
      );
      const users = await res.json();

      if (users.length > 0) {
        const user = users[0];

        localStorage.setItem('isAuth', 'true');
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('clinicUser', JSON.stringify(user));
        localStorage.setItem('role', user.role);

        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/student/dashboard');
        }
        return;
      }

      setError('Email atau Password salah!');
    } catch (error) {
      console.error('Login Error:', error);
      setError('Gagal menghubungi server database.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full font-sans bg-slate-50 text-slate-800">

      {/* HERO VIDEO */}
      <section className="relative w-full h-screen overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/kampus-video1.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/60 to-black/80 mix-blend-multiply"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 text-white z-10">
          <div className="mb-6">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full border-4 border-white/30 flex items-center justify-center mx-auto mb-4">
              <img src="/unklab.png" className="w-14 h-14 object-contain" />
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight drop-shadow-xl">
              <span className="text-purple-300"></span>
            </h1>
          </div>

          <p className="text-lg md:text-xl opacity-90 max-w-2xl leading-relaxed">
            
          </p>

          <div className="mt-16 animate-bounce text-white/50 flex flex-col items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest">
              Scroll untuk Login
            </span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* LOGIN AREA */}
      <section className="relative w-full min-h-screen flex items-center justify-center py-20 px-4">

        {/* BACKGROUND FOTO + BLUR */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: "url('/fix.jpg')",
            filter: "blur(8px)"
          }}
        ></div>

        {/* OVERLAY AGAR LEBIH TERLIHAT */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>

        {/* LOGIN CARD */}
        <div className="relative bg-white w-full max-w-5xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">

          {/* KIRI GAMBAR */}
          <div className="hidden md:block w-1/2 relative bg-slate-900">
            <img
              src="/pendaftran.jpg"
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 via-purple-900/40 to-transparent"></div>

            <div className="absolute bottom-0 left-0 p-10 text-white">
              <div className="w-12 h-1 bg-purple-400 mb-6"></div>
              <h2 className="text-4xl font-bold leading-tight mb-4">
                Masa Depan Cerah <br /> Dimulai Di Sini.
              </h2>
              <p className="text-purple-100 text-sm opacity-90">
                Sistem pendaftaran mahasiswa baru yang terintegrasi dan efisien.
              </p>
            </div>
          </div>

          {/* FORM LOGIN */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
            <div className="w-full max-w-sm mx-auto">

              <div className="mb-10 flex items-center gap-4">
                <img
                  src="/unklab.png"
                  alt="Logo"
                  className="h-14 w-14 object-contain"
                />

                <div className="flex flex-col">
                  <h2 className="text-xl font-bold text-slate-900 leading-tight">
                    UNIVERSITAS KLABAT
                  </h2>
                  <p className="text-sm text-slate-500 -mt-1">
                    Pathway to Excellence
                  </p>
                </div>
              </div>

              <h3 className="text-3xl font-bold text-slate-900">Selamat Datang</h3>
              <p className="text-slate-500 mt-2">Masuk ke portal pendaftaran mahasiswa.</p>

              {error && (
                <div className="mt-6 mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <User size={20} />
                    </div>

                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Password
                  </label>

                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock size={20} />
                    </div>

                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-lg shadow-lg transition"
                >
                  {isLoading ? "Memproses..." : "Masuk Sekarang"}
                </button>
              </form>

              <div className="mt-8 text-center border-t border-slate-100 pt-6">
                <p className="text-sm text-slate-500">
                  Belum punya akun?
                  <Link to="/register" className="ml-1 text-purple-700 font-bold">
                    Daftar Disini
                  </Link>
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LoginPage;
