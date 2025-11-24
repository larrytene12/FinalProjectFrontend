import React, { useState, useEffect } from 'react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Trash2, CalendarPlus, Calendar } from 'lucide-react';

const ScheduleManagerPage = () => {
  const [schedules, setSchedules] = useState([]);
  const [form, setForm] = useState({ date: '', time: '', quota: 20 });

  const fetchSchedules = () => {
    fetch('http://localhost:3033/schedules')
      .then(res => res.json())
      .then(data => setSchedules(data));
  };

  useEffect(() => { fetchSchedules(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if(!form.date || !form.time) return alert("Lengkapi data!");

    const newSchedule = { ...form, filled: 0 }; // Filled mulai dari 0
    
    await fetch('http://localhost:3033/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSchedule)
    });
    
    setForm({ date: '', time: '', quota: 20 }); // Reset form
    fetchSchedules(); // Refresh tabel
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Hapus jadwal ini?")) return;
    await fetch(`http://localhost:3033/schedules/${id}`, { method: 'DELETE' });
    fetchSchedules();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* FORM TAMBAH JADWAL (KIRI) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border h-fit">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <CalendarPlus className="text-blue-600"/> Buat Slot Baru
        </h3>
        <form onSubmit={handleAdd}>
          <Input 
            label="Tanggal Ujian" type="date" 
            value={form.date} onChange={e => setForm({...form, date: e.target.value})} 
          />
          <Input 
            label="Jam Mulai" type="time" 
            value={form.time} onChange={e => setForm({...form, time: e.target.value})} 
          />
          <Input 
            label="Kuota Peserta" type="number" 
            value={form.quota} onChange={e => setForm({...form, quota: e.target.value})} 
          />
          <Button type="submit">Tambah Jadwal</Button>
        </form>
      </div>

      {/* LIST JADWAL (KANAN) */}
      <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="font-bold text-lg mb-4">Daftar Jadwal Aktif</h3>
        <div className="grid gap-4">
          {schedules.map(item => (
            <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-lg text-blue-600 font-bold text-center min-w-[60px]">
                    <span className="block text-xs uppercase">Slot</span>
                    {item.time}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{item.date}</h4>
                  <p className="text-sm text-gray-500">Kuota: {item.filled} / {item.quota} Peserta</p>
                  {/* Progress Bar Kuota */}
                  <div className="w-32 bg-gray-200 rounded-full h-1.5 mt-2">
                    <div 
                        className="bg-blue-600 h-1.5 rounded-full" 
                        style={{ width: `${(item.filled/item.quota)*100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {schedules.length === 0 && <p className="text-gray-500 text-center">Belum ada jadwal.</p>}
        </div>
      </div>
    </div>
  );
};

export default ScheduleManagerPage;