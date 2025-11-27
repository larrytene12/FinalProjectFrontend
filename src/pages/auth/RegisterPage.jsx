// File: src/pages/auth/RegisterPage.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { UserPlus } from 'lucide-react';
import { APP_CONFIG } from '../../config';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Password tidak sama!");
      return;
    }

    setIsLoading(true);

    try {
      const checkRes = await fetch(`http://localhost:3033/users?email=${formData.email}`);
      const existingUser = await checkRes.json();

      if (existingUser.length > 0) {
        alert("Email sudah terdaftar!");
        setIsLoading(false);
        return;
      }

      const newUser = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: 'student',
        status: 'Draft',
        registrationStep: 1
      };

      await fetch('http://localhost:3033/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });

      alert("Registrasi Berhasil! Silakan Login.");
      navigate('/login');

    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">

      {/* ============================ */}
      {/*  🔥 BACKGROUND VIDEO FULL   */}
      {/* ============================ */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/kampus-video.mp4" type="video/mp4" />
      </video>

      {/* Darkness + blur overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      {/* ============================ */}
      {/* FORM CARD                   */}
      {/* ============================ */}
      <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-xl w-full max-w-md relative z-10 border border-white/20">

        <div className="text-center mb-8">
          <div className="flex justify-center mx-auto mb-4">
            <img
              src={APP_CONFIG.LOGO_URL}
              alt="Logo"
              className="h-16 w-auto object-contain"
            />
          </div>

          <h1 className="text-2xl font-bold text-white">Buat Akun Baru</h1>
          <p className="text-white/80 text-sm">{APP_CONFIG.NAME}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            label="Nama Lengkap"
            placeholder="Contoh: Budi Santoso"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />

          <Input
            label="Email"
            type="email"
            placeholder="nama@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="******"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <Input
            label="Konfirmasi Password"
            type="password"
            placeholder="******"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
          />

          <div className="mt-6">
            <Button type="submit" isLoading={isLoading}>
              <UserPlus size={18} className="mr-2" /> Daftar Sekarang
            </Button>
          </div>
        </form>

        <p className="text-center mt-6 text-white/80 text-sm">
          Sudah punya akun?{" "}
          <Link to="/login" className="text-white font-semibold underline">
            Login disini
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
