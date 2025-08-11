'use client';

import { useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import { Kas } from '@/types/kas'; 
import { Anggota } from '@/types/anggota';
import { MonthlyData, MonthlyStats } from '@/types/monthly';
import { useAuth } from '@/contexts/AuthContext';
import { KasService } from '@/services/kasService';
import { AnggotaService } from '@/services/anggotaService';
import { MonthlyService } from '@/services/monthlyService';
import KasStats from '@/components/kas/KasStats';
import MonthlyStatsComponent from '@/components/monthly/MonthlyStats';
import MonthlyTable from '@/components/monthly/MonthlyTable';
import IuranTable from '@/components/dashboard/IuranTable';

export default function Dashboard() {
  const { user } = useAuth();
  const [kasData, setKasData] = useState<Kas[]>([]);
  const [anggotaData, setAnggotaData] = useState<Anggota[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'monthly' | 'iuran'>('overview');
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    return new Date().toISOString().substring(0, 7); // Current month as default
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);

  // Load data from Supabase
  const loadData = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [kasResult, anggotaResult] = await Promise.all([
        KasService.getAll(user.id),
        AnggotaService.getAll(user.id)
      ]);
      setKasData(kasResult);
      setAnggotaData(anggotaResult.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())); // Sort by created_at (oldest first)
      setError(''); // Clear any previous errors
      
      // Get available months
      const months = MonthlyService.getAvailableMonths(kasResult);
      setAvailableMonths(months);
      
      // Calculate monthly data for selected month
      if (months.length > 0) {
        const currentMonthData = MonthlyService.getMonthlyData(kasResult, anggotaResult, selectedMonth);
        const currentMonthStats = MonthlyService.getMonthlyStats(currentMonthData);
        setMonthlyData(currentMonthData);
        setMonthlyStats(currentMonthStats);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  }, [user, selectedMonth]);

    useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  // Get recent transactions (5 latest)
  const recentTransactions = kasData
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

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

  // Handle month change
  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    if (kasData.length > 0 && anggotaData.length > 0) {
      const currentMonthData = MonthlyService.getMonthlyData(kasData, anggotaData, month);
      const currentMonthStats = MonthlyService.getMonthlyStats(currentMonthData);
      setMonthlyData(currentMonthData);
      setMonthlyStats(currentMonthStats);
    }
  };

  // Format month name for display
  const formatMonthName = (monthString: string) => {
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    const [year, month] = monthString.split('-');
    const monthIndex = parseInt(month) - 1;
    return `${monthNames[monthIndex]} ${year}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-3">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          {/* <p className="text-gray-600">Ringkasan sistem manajemen kas dan anggota Squad GCP</p> */}
          
          {/* Tab Navigation */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              {/* <button
                onClick={() => setActiveTab('monthly')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'monthly'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Dashboard Bulanan
              </button> */}
              <button
                onClick={() => setActiveTab('iuran')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'iuran'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Dashboard Bulanan
              </button>
            </nav>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => {
                setError('');
                loadData(); // Retry loading data
              }}
              className="text-red-600 hover:text-red-800 text-sm font-medium mt-2"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data dashboard...</p>
          </div>
        ) : (
          <>
            {/* Overview Tab Content */}
            {activeTab === 'overview' && (
              <>
                {/* Stats Overview */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistik Kas</h2>
                  <KasStats data={kasData} />
                </div>

                {/* <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistik Anggota</h2>
                  <AnggotaStats data={anggotaData} />
                </div> */}

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Recent Transactions */}
                  <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">Transaksi Terbaru</h2>
                      <Link 
                        href="/kas"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Lihat Semua →
                      </Link>
                    </div>
                    
                    {recentTransactions.length > 0 ? (
                      <div className="space-y-3">
                        {recentTransactions.map((kas) => (
                          <div key={kas.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                            <div className="flex items-center space-x-3">
                              <div className={`w-2 h-2 rounded-full ${
                                kas.jenis === 'masuk' ? 'bg-green-500' : 'bg-red-500'
                              }`}></div>
                              <div>
                                <p className="font-medium text-gray-900">{kas.keterangan}</p>
                                <p className="text-sm text-gray-500">
                                  {kas.kategori} • {formatDate(kas.tanggal)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-semibold ${
                                kas.jenis === 'masuk' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {kas.jenis === 'masuk' ? '+' : '-'}{formatCurrency(kas.jumlah)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                          </svg>
                        </div>
                        <p className="text-gray-500">Belum ada transaksi</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-6">
                  {/* Quick Add */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
                    <div className="space-y-3">
                      <Link
                        href="/kas"
                        className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 px-4 rounded-lg font-medium transition-colors"
                      >
                        + Tambah Transaksi Kas
                      </Link>
                      <Link
                        href="/kas"
                        className="block w-full border border-gray-300 hover:bg-gray-50 text-gray-700 text-center py-3 px-4 rounded-lg font-medium transition-colors"
                      >
                        📊 Lihat Laporan Kas
                      </Link>
                    </div>
                  </div>

                  {/* Summary Info */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Data</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-2">Kas</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Transaksi:</span>
                            <span className="font-medium">{kasData.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Transaksi Masuk:</span>
                            <span className="font-medium text-green-600">
                              {kasData.filter(k => k.jenis === 'masuk').length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Transaksi Keluar:</span>
                            <span className="font-medium text-red-600">
                              {kasData.filter(k => k.jenis === 'keluar').length}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t pt-4">
                        <h4 className="text-sm font-medium text-gray-600 mb-2">Anggota</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Anggota:</span>
                            <span className="font-medium">{anggotaData.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Anggota Aktif:</span>
                            <span className="font-medium text-green-600">
                              {anggotaData.filter(a => a.status === 'aktif').length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Anggota Non-Aktif:</span>
                            <span className="font-medium text-red-600">
                              {anggotaData.filter(a => a.status === 'non-aktif').length}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
              </>
            )}

            {/* Monthly Tab Content */}
            {activeTab === 'monthly' && (
              <>
                {/* Month Selector */}
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Dashboard Bulanan</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Periode: Mei 2025 - Desember 2025 (Target: Rp 100.000/bulan untuk {anggotaData.length} anggota)
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Target per anggota: ~{MonthlyService.formatCurrency(MonthlyService.getTargetPerAnggotaPublic(anggotaData.length))}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <label htmlFor="month-select" className="text-sm font-medium text-gray-700">
                        Pilih Bulan:
                      </label>
                      <select
                        id="month-select"
                        value={selectedMonth}
                        onChange={(e) => handleMonthChange(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {availableMonths.map((month) => (
                          <option key={month} value={month}>
                            {formatMonthName(month)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Monthly Stats */}
                {monthlyStats && monthlyData && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Statistik {monthlyData.monthName}
                    </h3>
                    <MonthlyStatsComponent 
                      stats={monthlyStats} 
                      targetPemasukanBulan={monthlyData.targetPemasukanBulan}
                    />
                  </div>
                )}

                {/* Monthly Table */}
                {monthlyData && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Detail Iuran {monthlyData.monthName}
                    </h3>
                    <MonthlyTable data={monthlyData.anggota} targetPerAnggota={monthlyData.targetPerAnggota} />
                  </div>
                )}

                {/* Monthly Summary */}
                {monthlyData && (
                  <>
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan {monthlyData.monthName}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-blue-600 font-medium">Target Pemasukan Bulan Ini</p>
                          <p className="text-xl font-bold text-blue-800">
                            {MonthlyService.formatCurrency(monthlyData.targetPemasukanBulan)}
                          </p>
                          <p className="text-blue-600 text-xs">
                            {anggotaData.length} anggota × ~{MonthlyService.formatCurrency(monthlyData.targetPerAnggota)}
                          </p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-green-600 font-medium">Total Terkumpul Bulan Ini</p>
                          <p className="text-xl font-bold text-green-800">
                            {MonthlyService.formatCurrency(monthlyData.totalIuran)}
                          </p>
                          <p className="text-green-600 text-xs">
                            Iuran bulan {monthlyData.monthName}
                          </p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <p className="text-purple-600 font-medium">Sisa ke Bulan Depan</p>
                          <p className={`text-xl font-bold ${
                            monthlyData.totalKeSisaBerikutnya >= 0 ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {monthlyData.totalKeSisaBerikutnya >= 0 ? '+' : ''}
                            {MonthlyService.formatCurrency(monthlyData.totalKeSisaBerikutnya)}
                          </p>
                          <p className="text-purple-600 text-xs">
                            Kelebihan atau kekurangan
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Periode Keseluruhan */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Periode (Mei - Desember 2025)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-indigo-50 p-4 rounded-lg">
                          <p className="text-indigo-600 font-medium">Target Total Periode</p>
                          <p className="text-xl font-bold text-indigo-800">
                            {MonthlyService.formatCurrency(monthlyData.targetPemasukanBulan * 8)}
                          </p>
                          <p className="text-indigo-600 text-xs">
                            8 bulan × Rp 100.000
                          </p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-green-600 font-medium">Total Terkumpul s.d. Sekarang</p>
                          <p className="text-xl font-bold text-green-800">
                            {MonthlyService.formatCurrency(
                              monthlyData.anggota.reduce((sum, a) => sum + (a.totalIuranFromStart || 0), 0)
                            )}
                          </p>
                          <p className="text-green-600 text-xs">
                            Dari Mei s.d. {monthlyData.monthName}
                          </p>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <p className="text-yellow-600 font-medium">Progress Keseluruhan</p>
                          <p className="text-xl font-bold text-yellow-800">
                            {Math.round(
                              (monthlyData.anggota.reduce((sum, a) => sum + (a.totalIuranFromStart || 0), 0) / 
                               (monthlyData.targetPemasukanBulan * 8)) * 100
                            )}%
                          </p>
                          <p className="text-yellow-600 text-xs">
                            Menuju target Desember 2025
                          </p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg">
                          <p className="text-red-600 font-medium">Sisa yang Dibutuhkan</p>
                          <p className="text-xl font-bold text-red-800">
                            {MonthlyService.formatCurrency(
                              Math.max(0, (monthlyData.targetPemasukanBulan * 8) - 
                                monthlyData.anggota.reduce((sum, a) => sum + (a.totalIuranFromStart || 0), 0))
                            )}
                          </p>
                          <p className="text-red-600 text-xs">
                            Untuk mencapai target
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Iuran Tab Content */}
            {activeTab === 'iuran' && (
              <div className="space-y-6">
                <IuranTable />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
