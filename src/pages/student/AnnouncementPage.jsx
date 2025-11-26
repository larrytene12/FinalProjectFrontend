import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Download, FileText, Award, Clock, Lock, ChevronRight, Ban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button'; 
import jsPDF from 'jspdf';
// import confetti from 'canvas-confetti'; // Uncomment jika sudah install

const AnnouncementPage = () => {
  const navigate = useNavigate();
  // Ambil data terbaru dari localStorage
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('clinicUser') || localStorage.getItem('user')));
  
  const examStatus = user?.examStatus || 'Belum Ujian';
  const examScore = user?.examScore || 0;
  const PASSING_GRADE = 70;

  // Tentukan status kelulusan berdasarkan nilai
  const isPassed = examStatus === 'Selesai' && examScore >= PASSING_GRADE;
  const isFailed = (examStatus === 'Selesai' && examScore < PASSING_GRADE) || examStatus === 'Diskualifikasi';
  const isLocked = examStatus !== 'Selesai' && examStatus !== 'Diskualifikasi';

  useEffect(() => {
    // Efek Kembang Api HANYA jika Lulus
    if (isPassed) {
      // Confetti logic (Disabled to prevent crash if not installed)
      console.log("Celebration triggered!");
    }
  }, [isPassed]);

  const handleDownloadSKL = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18); doc.setFont('helvetica', 'bold');
    doc.text('UNIVERSITAS ', 105, 20, null, null, 'center');
    doc.setFontSize(12); doc.setFont('helvetica', 'normal');
    doc.text('Jalan Arnold Mononutu, Airmadidi, Airmadidi Bawah, Airmadidi,', 105, 28, null, null, 'center');
    doc.text('Kabupaten Minahasa Utara, Sulawesi Utara 95371, Indonesia', 105, 28, null, null, 'center');
    doc.line(20, 35, 190, 35);

    doc.setFontSize(16); doc.setFont('helvetica', 'bold');
    doc.text('SURAT KETERANGAN LULUS', 105, 60, null, null, 'center');
    
    doc.setFontSize(12); doc.setFont('helvetica', 'normal');
    doc.text('Berdasarkan hasil Ujian Saringan Masuk (USM) dan verifikasi berkas,', 20, 80);
    doc.text('Rektor Universitas KLABAT menerangkan bahwa:', 20, 86);

    doc.text(`Nama Lengkap : ${user.fullName}`, 30, 100);
    doc.text(`Nomor Peserta : USM-${user.id.toString().toUpperCase()}`, 30, 108);
    doc.text(`Program Studi : ${user.major}`, 30, 116);
    
    doc.setFontSize(20); doc.setFont('helvetica', 'bold'); doc.setTextColor(0, 128, 0);
    doc.text('DINYATAKAN LULUS', 105, 140, null, null, 'center');
    doc.setTextColor(0, 0, 0);

    doc.setFontSize(12); doc.setFont('helvetica', 'normal');
    doc.text('Demikian surat keterangan ini dibuat untuk dapat dipergunakan', 20, 160);
    doc.text('sebagai syarat Pendaftaran Ulang.', 20, 166);

    doc.text(`Airmadidi, ${new Date().toLocaleDateString('id-ID')}`, 140, 190);
    doc.text('Rektor,', 140, 200);
    doc.text('(  Pdt. Danny I. Rantung, PhD )', 140, 230);

    doc.save(`SKL_${user.fullName}.pdf`);
  };

  // --- TAMPILAN 1: BELUM UJIAN (TERKUNCI) ---
  if (isLocked) {
    return (
      <div className="max-w-3xl mx-auto mt-10">
        <div className="glass-panel p-10 rounded-[2.5rem] text-center shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-slate-300 to-slate-400"></div>
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-inner">
                <Lock size={40} className="text-slate-400"/>
            </div>
            <h2 className="text-3xl font-black text-slate-700 mb-3">Pengumuman Belum Tersedia</h2>
            <p className="text-slate-500 mb-8 text-lg max-w-lg mx-auto">
                Anda belum menyelesaikan tahapan seleksi. <br/>
                Silakan selesaikan <strong>Ujian Online (CBT)</strong> terlebih dahulu.
            </p>
            <div className="mt-10">
                <Button onClick={() => navigate('/student/dashboard')} className="bg-slate-800 text-white hover:bg-slate-900 px-8 py-3 rounded-xl shadow-lg">
                    Kembali ke Dashboard <ChevronRight size={18} className="ml-2"/>
                </Button>
            </div>
        </div>
      </div>
    );
  }

  // --- TAMPILAN 2: GAGAL (NILAI < 70 ATAU DISKUALIFIKASI) ---
  if (isFailed) {
    return (
      <div className="max-w-2xl mx-auto mt-10 glass-card p-10 text-center rounded-[2rem] border-t-8 border-red-500 shadow-2xl animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
           {examStatus === 'Diskualifikasi' ? <Ban size={48} className="text-red-600"/> : <XCircle size={48} className="text-red-600"/>}
        </div>
        <h2 className="text-3xl font-black text-slate-800 mb-4">
            {examStatus === 'Diskualifikasi' ? 'DISKUALIFIKASI' : 'Mohon Maaf'}
        </h2>
        <p className="text-slate-600 mb-6 leading-relaxed font-medium">
           {examStatus === 'Diskualifikasi' 
             ? 'Anda didiskualifikasi karena pelanggaran aturan ujian.' 
             : 'Berdasarkan hasil nilai Ujian Saringan Masuk (USM), Anda belum memenuhi standar kelulusan.'}
        </p>
        <div className="bg-slate-50 p-6 rounded-2xl text-left space-y-3 mb-8 border border-slate-100">
           <p className="text-sm font-bold text-slate-700 uppercase tracking-wider">Rincian Hasil:</p>
           <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
              <li>Nilai Anda: <strong className="text-red-600">{examScore}</strong></li>
              <li>Passing Grade (KKM): <strong>{PASSING_GRADE}</strong></li>
              <li>Status: <span className="text-red-600 font-bold">{examStatus === 'Diskualifikasi' ? 'Pelanggaran Berat' : 'Tidak Lulus'}</span></li>
           </ul>
        </div>
        <Button variant="outline" onClick={() => navigate('/student/dashboard')}>Kembali ke Dashboard</Button>
      </div>
    );
  }

  // --- TAMPILAN 3: LULUS (NILAI >= 70) ---
  return (
    <div className="max-w-4xl mx-auto mt-6 animate-in zoom-in duration-700">
      <div className="glass-panel p-12 rounded-[3rem] text-center relative overflow-hidden shadow-2xl border-t-8 border-green-500 bg-white/90 backdrop-blur-xl">
        
        <div className="relative z-10">
            <div className="inline-block p-5 bg-green-50 rounded-full mb-6 shadow-lg shadow-green-100 ring-4 ring-white animate-bounce">
                <Award size={64} className="text-green-600"/>
            </div>
            
            <h1 className="text-5xl font-black text-slate-800 mb-2 tracking-tight">SELAMAT!</h1>
            <h2 className="text-2xl font-bold text-green-600 mb-8 uppercase tracking-widest">Anda Dinyatakan Lulus</h2>
            
            <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                Selamat bergabung menjadi bagian dari civitas akademika <strong>Universitas Klabat</strong>. 
                Nilai ujian Anda memenuhi standar kualifikasi kami.
            </p>

            {/* Informasi Kelulusan */}
            <div className="bg-white border border-slate-100 rounded-3xl p-8 max-w-3xl mx-auto mb-10 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">Nama Mahasiswa</p>
                        <p className="text-xl font-bold text-slate-800">{user.fullName}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">Program Studi</p>
                        <p className="text-xl font-bold text-slate-800">{user.major}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">Nomor Peserta</p>
                        <p className="text-xl font-bold text-slate-800 font-mono">USM-{user.id.toString().toUpperCase()}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">Nilai Ujian</p>
                        <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm flex items-center gap-2 w-fit">
                            <CheckCircle size={14}/> {user.examScore} / 100
                        </span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                    onClick={handleDownloadSKL} 
                    className="bg-slate-900 text-white shadow-xl hover:bg-black px-8 py-4 rounded-2xl text-lg transition-transform hover:scale-105"
                >
                    <Download size={20} className="mr-2"/> Unduh Surat Lulus (SKL)
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementPage;