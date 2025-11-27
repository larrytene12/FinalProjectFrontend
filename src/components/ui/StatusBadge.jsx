import React from 'react';

const StatusBadge = ({ status }) => {
  const styles = {
    'Draft': 'bg-gray-100 text-gray-600 border-gray-200',
    'Verifikasi Berkas': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Diterima': 'bg-green-100 text-green-700 border-green-200',
    'Ditolak': 'bg-red-100 text-red-700 border-red-200',
    'Cadangan': 'bg-orange-100 text-orange-700 border-orange-200'
  };

  const defaultStyle = 'bg-blue-50 text-blue-600 border-blue-100';

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || defaultStyle}`}>
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;