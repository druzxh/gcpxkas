'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { KasService } from '@/services/kasService';
import { AnggotaService } from '@/services/anggotaService';

interface IuranData {
  anggotaId: string;
  nama: string;
  nickname: string;
  monthlyPayments: { [key: string]: number }; // "2025-01": 20000
}

interface MonthInfo {
  value: string; // "2025-01"
  label: string; // "Jan"
  fullLabel: string; // "Januari 2025"
}

export default function IuranTable() {
  const { user } = useAuth();
  const [iuranData, setIuranData] = useState<IuranData[]>([]);
  const [months, setMonths] = useState<MonthInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Generate months for selected year
  const generateMonths = useCallback((year: number): MonthInfo[] => {
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    
    const fullMonthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    return monthNames.map((month, index) => ({
      value: `${year}-${String(index + 1).padStart(2, '0')}`,
      label: month,
      fullLabel: `${fullMonthNames[index]} ${year}`
    }));
  }, []);

  const loadIuranData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get all anggota
      const anggotaList = await AnggotaService.getAll(user.id);
      const activeAnggota = anggotaList
        .filter(a => a.status === 'aktif')
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); // Sort by created_at (oldest first)
      
      // Get all kas data for the selected year
      const kasData = await KasService.getAll(user.id);
      const iuranKas = kasData.filter(kas => 
        kas.kategori === 'Iuran Bulanan' && 
        kas.jenis === 'masuk' && 
        kas.bulanPembayaran &&
        kas.bulanPembayaran.startsWith(selectedYear.toString()) &&
        kas.anggotaId
      );

      // Group payments by anggota and month
      const paymentsMap = new Map<string, { [month: string]: number }>();
      
      iuranKas.forEach(kas => {
        const anggotaId = kas.anggotaId!;
        const month = kas.bulanPembayaran!;
        
        if (!paymentsMap.has(anggotaId)) {
          paymentsMap.set(anggotaId, {});
        }
        
        const anggotaPayments = paymentsMap.get(anggotaId)!;
        anggotaPayments[month] = (anggotaPayments[month] || 0) + kas.jumlah;
      });

      // Create iuran data structure
      const data: IuranData[] = activeAnggota.map(anggota => ({
        anggotaId: anggota.id,
        nama: anggota.nama,
        nickname: anggota.nickname,
        monthlyPayments: paymentsMap.get(anggota.id) || {}
      })).sort((a, b) => {
        // Sort by created_at (find anggota from activeAnggota list)
        const anggotaA = activeAnggota.find(ang => ang.id === a.anggotaId);
        const anggotaB = activeAnggota.find(ang => ang.id === b.anggotaId);
        if (!anggotaA || !anggotaB) return 0;
        return new Date(anggotaA.createdAt).getTime() - new Date(anggotaB.createdAt).getTime();
      });

      setIuranData(data);
      setMonths(generateMonths(selectedYear));
    } catch (error) {
      console.error('Error loading iuran data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, selectedYear, generateMonths]);

  useEffect(() => {
    if (user) {
      loadIuranData();
    }
  }, [user, selectedYear, loadIuranData]);

  // Calculate totals
  const calculateMonthTotal = (month: string): number => {
    return iuranData.reduce((total, anggota) => {
      return total + (anggota.monthlyPayments[month] || 0);
    }, 0);
  };

  const calculateAnggotaTotal = (anggota: IuranData): number => {
    return Object.values(anggota.monthlyPayments).reduce((total, amount) => total + amount, 0);
  };

  const calculateGrandTotal = (): number => {
    return iuranData.reduce((total, anggota) => total + calculateAnggotaTotal(anggota), 0);
  };

  const getCellColor = (amount: number): string => {
    if (amount === 0) return 'bg-gray-50 text-gray-400';
    if (amount < 20000) return 'bg-yellow-50 text-yellow-700';
    if (amount === 20000) return 'bg-green-50 text-green-700';
    return 'bg-blue-50 text-blue-700';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Tabel Iuran Bulanan</h3>
            <p className="text-sm text-gray-600">Pembayaran iuran per anggota per bulan</p>
          </div>
          
          {/* Year Selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Tahun:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[2023, 2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Table Header */}
          <thead className="bg-gray-50">
            <tr>
              <th className="sticky left-0 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider z-10">
                Anggota
              </th>
              {months.map(month => (
                <th key={month.value} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
                  <div title={month.fullLabel}>
                    {month.label}
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100">
                Total
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {iuranData.map((anggota) => (
              <tr key={anggota.anggotaId} className="hover:bg-gray-50">
                {/* Anggota Name - Sticky */}
                <td className="sticky left-0 bg-white px-6 py-4 whitespace-nowrap z-10 border-r border-gray-200">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{anggota.nama}</div>
                    {/* <div className="text-sm text-gray-500">({anggota.nickname})</div> */}
                  </div>
                </td>
                
                {/* Monthly Payments */}
                {months.map(month => {
                  const amount = anggota.monthlyPayments[month.value] || 0;
                  return (
                    <td key={month.value} className={`px-3 py-4 whitespace-nowrap text-center text-sm ${getCellColor(amount)}`}>
                      {amount === 0 ? '-' : amount.toLocaleString('id-ID')}
                    </td>
                  );
                })}
                
                {/* Total for this anggota */}
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-gray-900 bg-gray-50">
                  {calculateAnggotaTotal(anggota).toLocaleString('id-ID')}
                </td>
              </tr>
            ))}
            
            {/* Footer Row - Monthly Totals */}
            <tr className="bg-gray-100 font-semibold">
              <td className="sticky left-0 bg-gray-100 px-6 py-4 text-sm text-gray-900 z-10 border-r border-gray-200">
                Total per Bulan
              </td>
              {months.map(month => (
                <td key={month.value} className="px-3 py-4 text-center text-sm text-gray-900">
                  {calculateMonthTotal(month.value).toLocaleString('id-ID')}
                </td>
              ))}
              <td className="px-6 py-4 text-center text-sm text-gray-900 bg-gray-200">
                {calculateGrandTotal().toLocaleString('id-ID')}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-50 border border-gray-300 rounded"></div>
            <span className="text-gray-600">Belum bayar</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-50 border border-yellow-300 rounded"></div>
            <span className="text-gray-600">Kurang dari 20rb</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-50 border border-green-300 rounded"></div>
            <span className="text-gray-600">Tepat 20rb</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-50 border border-blue-300 rounded"></div>
            <span className="text-gray-600">Lebih dari 20rb</span>
          </div>
        </div>
      </div>
    </div>
  );
}
