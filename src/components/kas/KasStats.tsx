import { Kas } from '@/types/kas';

interface KasStatsProps {
  data: Kas[];
}

export default function KasStats({ data }: KasStatsProps) {
  // Hitung total pemasukan
  const totalMasuk = data
    .filter(kas => kas.jenis === 'masuk')
    .reduce((total, kas) => total + kas.jumlah, 0);

  // Hitung total pengeluaran
  const totalKeluar = data
    .filter(kas => kas.jenis === 'keluar')
    .reduce((total, kas) => total + kas.jumlah, 0);

  // Hitung saldo
  const saldo = totalMasuk - totalKeluar;

  // Ringkasan per anggota
  const ringkasanPerAnggota = data.reduce((acc, kas) => {
    const anggotaKey = kas.anggota?.nama || 'Tanpa Anggota';
    const anggotaId = kas.anggota?.id || 'no-anggota';
    
    if (!acc[anggotaKey]) {
      acc[anggotaKey] = {
        id: anggotaId,
        nama: anggotaKey,
        nickname: kas.anggota?.nickname || '',
        totalMasuk: 0,
        totalKeluar: 0,
        saldo: 0,
        jumlahTransaksi: 0
      };
    }
    
    if (kas.jenis === 'masuk') {
      acc[anggotaKey].totalMasuk += kas.jumlah;
    } else {
      acc[anggotaKey].totalKeluar += kas.jumlah;
    }
    
    acc[anggotaKey].saldo = acc[anggotaKey].totalMasuk - acc[anggotaKey].totalKeluar;
    acc[anggotaKey].jumlahTransaksi += 1;
    
    return acc;
  }, {} as Record<string, {
    id: string;
    nama: string;
    nickname: string;
    totalMasuk: number;
    totalKeluar: number;
    saldo: number;
    jumlahTransaksi: number;
  }>);

  const ringkasanArray = Object.values(ringkasanPerAnggota)
    .sort((a, b) => b.saldo - a.saldo);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Kas Masuk */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Kas Masuk</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalMasuk)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Total Kas Keluar */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Kas Keluar</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(totalKeluar)}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Saldo */}
        <div className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${saldo >= 0 ? 'border-blue-500' : 'border-orange-500'}`}>
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Saldo Kas</p>
              <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {formatCurrency(saldo)}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${saldo >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
              <svg className={`w-6 h-6 ${saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Total Transaksi */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Transaksi</p>
              <p className="text-2xl font-bold text-purple-600">
                {data.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Ringkasan Per Anggota */}
      {ringkasanArray.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Ringkasan Kas Per Anggota</h3>
            <p className="text-sm text-gray-600 mt-1">Total kas masuk, keluar, dan saldo per anggota</p>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm font-medium text-gray-500 border-b">
                    <th className="pb-3">Anggota</th>
                    <th className="pb-3 text-right">Kas Masuk</th>
                    <th className="pb-3 text-right">Kas Keluar</th>
                    <th className="pb-3 text-right">Saldo</th>
                    <th className="pb-3 text-center">Transaksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ringkasanArray.map((anggota) => (
                    <tr key={anggota.id} className="hover:bg-gray-50">
                      <td className="py-4">
                        <div>
                          <div className="font-medium text-gray-900">{anggota.nama}</div>
                          {anggota.nickname && anggota.nama !== 'Tanpa Anggota' && (
                            <div className="text-sm text-gray-500">@{anggota.nickname}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 text-right text-green-600 font-medium">
                        {formatCurrency(anggota.totalMasuk)}
                      </td>
                      <td className="py-4 text-right text-red-600 font-medium">
                        {formatCurrency(anggota.totalKeluar)}
                      </td>
                      <td className={`py-4 text-right font-bold ${anggota.saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                        {formatCurrency(anggota.saldo)}
                      </td>
                      <td className="py-4 text-center text-gray-600">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100">
                          {anggota.jumlahTransaksi}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
