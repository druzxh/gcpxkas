'use client';

import { useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import { Kas } from '@/types/kas'; 
import { Anggota } from '@/types/anggota';
import { useAuth } from '@/contexts/AuthContext';
import { KasService } from '@/services/kasService';
import { AnggotaService } from '@/services/anggotaService';
import KasStats from '@/components/kas/KasStats';
import AnggotaStats from '@/components/anggota/AnggotaStats';

export default function Dashboard() {
  const { user } = useAuth();
  const [kasData, setKasData] = useState<Kas[]>([]);
  const [anggotaData, setAnggotaData] = useState<Anggota[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      setAnggotaData(anggotaResult);
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  }, [user]);

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Ringkasan sistem manajemen kas dan anggota Squad GCP</p>
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
            {/* Stats Overview */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistik Kas</h2>
              <KasStats data={kasData} />
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistik Anggota</h2>
              <AnggotaStats data={anggotaData} />
            </div>
          </>
        )}

        {/* Content Grid */}
        {!loading && (
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
        )}
      </div>
    </div>
  );
}
