import { useState, useEffect } from 'react';
import { KasService } from '@/services/kasService';
import { AnggotaService } from '@/services/anggotaService';
import { MonthUtils } from '@/lib/monthUtils';
import { BulanOption, PembayaranBulanan } from '@/types/kas';
import { Anggota } from '@/types/anggota';
import { useAuth } from '@/contexts/AuthContext';

interface PembayaranBulananViewProps {
  onClose: () => void;
}

export default function PembayaranBulananView({ onClose }: PembayaranBulananViewProps) {
  const { user } = useAuth();
  const [selectedBulan, setSelectedBulan] = useState<string>(MonthUtils.getCurrentMonth());
  const [bulanOptions, setBulanOptions] = useState<BulanOption[]>([]);
  const [anggotaList, setAnggotaList] = useState<Anggota[]>([]);
  const [pembayaranList, setPembayaranList] = useState<PembayaranBulanan[]>([]);
  const [loading, setLoading] = useState(false);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          // Load anggota
          const anggota = await AnggotaService.getAll(user.id);
          setAnggotaList(anggota
            .filter(a => a.status === 'aktif')
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) // Sort by created_at (oldest first)
          );
          
          // Load bulan options
          const options = MonthUtils.generateBulanOptions();
          setBulanOptions(options);
        } catch (error) {
          console.error('Error loading data:', error);
        }
      }
    };
    loadData();
  }, [user]);

  // Load pembayaran untuk bulan terpilih
  useEffect(() => {
    const loadPembayaran = async () => {
      if (user && selectedBulan && anggotaList.length > 0) {
        setLoading(true);
        try {
          const pembayaran = await KasService.getPembayaranBulananByMonth(user.id, selectedBulan);
          
          // Merge dengan anggota yang belum bayar
          const pembayaranMap = new Map(pembayaran.map(p => [p.anggotaId, p]));
          const allPembayaran = anggotaList.map(anggota => {
            const existing = pembayaranMap.get(anggota.id);
            return existing || {
              anggotaId: anggota.id,
              bulan: selectedBulan,
              sudahBayar: false,
              jumlahBayar: 0,
            };
          });
          
          setPembayaranList(allPembayaran);
        } catch (error) {
          console.error('Error loading pembayaran:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadPembayaran();
  }, [user, selectedBulan, anggotaList]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (pembayaran: PembayaranBulanan) => {
    if (!pembayaran.sudahBayar) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Belum Bayar</span>;
    }
    if (pembayaran.jumlahBayar >= 20000) {
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Lunas</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Kurang</span>;
  };

  const stats = {
    totalAnggota: anggotaList.length,
    sudahBayar: pembayaranList.filter(p => p.sudahBayar).length,
    belumBayar: pembayaranList.filter(p => !p.sudahBayar).length,
    totalTerkumpul: pembayaranList.reduce((sum, p) => sum + p.jumlahBayar, 0),
    targetTotal: anggotaList.length * 20000,
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Laporan Pembayaran Iuran Bulanan
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Filter Bulan */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Pilih Bulan:</label>
            <select
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {bulanOptions.map(bulan => (
                <option key={bulan.value} value={bulan.value}>
                  {bulan.label} {bulan.isCurrent ? '(Bulan Ini)' : bulan.isPast ? '(Bulan Lalu)' : '(Bulan Depan)'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.totalAnggota}</div>
            <div className="text-sm text-blue-600">Total Anggota</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.sudahBayar}</div>
            <div className="text-sm text-green-600">Sudah Bayar</div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stats.belumBayar}</div>
            <div className="text-sm text-red-600">Belum Bayar</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalTerkumpul)}</div>
            <div className="text-sm text-purple-600">Terkumpul</div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(stats.targetTotal)}</div>
            <div className="text-sm text-orange-600">Target</div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Anggota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah Bayar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal Bayar
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sisa/Kelebihan
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pembayaranList.map((pembayaran) => {
                  const anggota = anggotaList.find(a => a.id === pembayaran.anggotaId);
                  const sisa = 20000 - pembayaran.jumlahBayar;
                  
                  return (
                    <tr key={pembayaran.anggotaId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {anggota && (
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                              <span className="text-xs font-medium text-blue-600">
                                {anggota.nickname.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {anggota.nama}
                              </div>
                              <div className="text-xs text-gray-500">
                                {anggota.nickname}
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(pembayaran)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <span className={pembayaran.sudahBayar ? 'text-green-600' : 'text-gray-400'}>
                          {formatCurrency(pembayaran.jumlahBayar)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pembayaran.tanggalBayar ? (
                          new Date(pembayaran.tanggalBayar).toLocaleDateString('id-ID')
                        ) : (
                          <span className="text-gray-400 italic">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {sisa === 0 ? (
                          <span className="text-green-600">Lunas</span>
                        ) : sisa > 0 ? (
                          <span className="text-red-600">-{formatCurrency(sisa)}</span>
                        ) : (
                          <span className="text-blue-600">+{formatCurrency(-sisa)}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Progress: {stats.sudahBayar}/{stats.totalAnggota} anggota ({Math.round((stats.sudahBayar / stats.totalAnggota) * 100)}%)
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
