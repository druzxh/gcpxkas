import React from 'react';
import { Kas } from '@/types/kas';
import { MonthUtils } from '@/lib/monthUtils';

interface KasTableProps {
  data: Kas[];
  onEdit: (kas: Kas) => void;
  onDelete: (id: string) => void;
}

interface GroupedData {
  bulanIuran: string | null;
  bulanLabel: string;
  transaksi: Kas[];
  totalMasuk: number;
  totalKeluar: number;
}

export default function KasTable({ data, onEdit, onDelete }: KasTableProps) {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Grup data berdasarkan bulan iuran
  const groupedData: GroupedData[] = React.useMemo(() => {
    const groups = new Map<string, GroupedData>();
    
    data.forEach(kas => {
      const key = kas.bulanPembayaran || 'non-iuran';
      
      if (!groups.has(key)) {
        groups.set(key, {
          bulanIuran: kas.bulanPembayaran || null,
          bulanLabel: kas.bulanPembayaran 
            ? MonthUtils.parseBulanToLabel(kas.bulanPembayaran)
            : 'Transaksi Lainnya',
          transaksi: [],
          totalMasuk: 0,
          totalKeluar: 0,
        });
      }
      
      const group = groups.get(key)!;
      group.transaksi.push(kas);
      
      if (kas.jenis === 'masuk') {
        group.totalMasuk += kas.jumlah;
      } else {
        group.totalKeluar += kas.jumlah;
      }
    });
    
    return Array.from(groups.values()).sort((a, b) => {
      // Prioritaskan grup dengan bulan iuran
      if (a.bulanIuran && !b.bulanIuran) return -1;
      if (!a.bulanIuran && b.bulanIuran) return 1;
      
      // Jika keduanya memiliki bulan iuran, urutkan berdasarkan bulan (terbaru dulu)
      if (a.bulanIuran && b.bulanIuran) {
        return b.bulanIuran.localeCompare(a.bulanIuran);
      }
      
      // Jika keduanya tidak memiliki bulan iuran
      return 0;
    });
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada data kas</h3>
        <p className="text-gray-500">Klik tombol &quot;Tambah Kas&quot; untuk menambahkan transaksi pertama Anda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupedData.map((group, groupIndex) => (
        <div key={group.bulanIuran || 'non-iuran'} className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Header Grup */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">
                    {group.bulanIuran ? '📅' : '📋'}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {group.bulanLabel}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {group.transaksi.length} transaksi
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="text-center">
                  <p className="font-medium text-green-600">
                    {formatCurrency(group.totalMasuk)}
                  </p>
                  <p className="text-xs text-gray-500">Masuk</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-red-600">
                    {formatCurrency(group.totalKeluar)}
                  </p>
                  <p className="text-xs text-gray-500">Keluar</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-900">
                    {formatCurrency(group.totalMasuk - group.totalKeluar)}
                  </p>
                  <p className="text-xs text-gray-500">Saldo</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabel Transaksi */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Keterangan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Anggota
                  </th>
                  {!group.bulanIuran && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jenis
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {group.transaksi.map((kas) => (
                  <tr key={kas.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(kas.tanggal)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate" title={kas.keterangan}>
                        {kas.keterangan}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {kas.anggota ? (
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                            <span className="text-xs font-medium text-blue-600">
                              {kas.anggota.nickname.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {kas.anggota.nickname}
                            </div>
                            <div className="text-xs text-gray-500">
                              {kas.anggota.nama}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">-</span>
                      )}
                    </td>
                    {!group.bulanIuran && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {kas.kategori}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        kas.jenis === 'masuk'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {kas.jenis === 'masuk' ? '↗ Masuk' : '↘ Keluar'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                      <span className={kas.jenis === 'masuk' ? 'text-green-600' : 'text-red-600'}>
                        {kas.jenis === 'masuk' ? '+' : '-'}{formatCurrency(kas.jumlah)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => onEdit(kas)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </button>
                        <button
                          onClick={() => onDelete(kas.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Hapus"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      
      {/* Summary Total */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 font-medium">
            Total Keseluruhan: {data.length} transaksi
          </span>
          <div className="flex space-x-6">
            <span className="text-green-600 font-bold text-lg">
              Masuk: {formatCurrency(data.filter(k => k.jenis === 'masuk').reduce((sum, k) => sum + k.jumlah, 0))}
            </span>
            <span className="text-red-600 font-bold text-lg">
              Keluar: {formatCurrency(data.filter(k => k.jenis === 'keluar').reduce((sum, k) => sum + k.jumlah, 0))}
            </span>
            <span className="text-gray-900 font-bold text-xl">
              Saldo: {formatCurrency(
                data.filter(k => k.jenis === 'masuk').reduce((sum, k) => sum + k.jumlah, 0) -
                data.filter(k => k.jenis === 'keluar').reduce((sum, k) => sum + k.jumlah, 0)
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
