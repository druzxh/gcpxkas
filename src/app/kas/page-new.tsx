'use client';

import { useCallback, useState, useEffect } from 'react';
import { Kas, KasFormData } from '@/types/kas';
import { useAuth } from '@/contexts/AuthContext';
import { KasService } from '@/services/kasService';
import KasTable from '@/components/kas/KasTable';
import KasForm from '@/components/kas/KasForm';
import KasStats from '@/components/kas/KasStats';
import PembayaranBulananView from '@/components/kas/PembayaranBulananView';

export default function KasPage() {
  const { user } = useAuth();
  const [kasData, setKasData] = useState<Kas[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingKas, setEditingKas] = useState<Kas | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJenis, setFilterJenis] = useState<'all' | 'masuk' | 'keluar'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPembayaranBulanan, setShowPembayaranBulanan] = useState(false);

  // Load data from Supabase
  const loadKasData = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await KasService.getAll(user.id);
      setKasData(data);
    } catch (err) {
      setError('Gagal memuat data kas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadKasData();
    }
  }, [user, loadKasData]);

  const handleCreate = async (formData: KasFormData) => {
    if (!user) return;
    
    try {
      const newKas = await KasService.create(user.id, formData);
      setKasData([newKas, ...kasData]);
      setIsFormOpen(false);
      setError(''); // Clear any previous errors
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menambah data kas';
      setError(errorMessage);
      console.error(err);
    }
  };

  const handleUpdate = async (formData: KasFormData) => {
    if (!editingKas) return;
    
    try {
      const updatedKas = await KasService.update(editingKas.id, formData);
      setKasData(kasData.map(kas => kas.id === editingKas.id ? updatedKas : kas));
      setEditingKas(null);
      setIsFormOpen(false);
      setError(''); // Clear any previous errors
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengupdate data kas';
      setError(errorMessage);
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data kas ini?')) {
      try {
        await KasService.delete(id);
        setKasData(kasData.filter(kas => kas.id !== id));
      } catch (err) {
        setError('Gagal menghapus data kas');
        console.error(err);
      }
    }
  };

  const handleEdit = (kas: Kas) => {
    setEditingKas(kas);
    setIsFormOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingKas(null);
    setIsFormOpen(false);
  };

  // Filter dan search data
  const filteredData = kasData.filter(kas => {
    const matchesSearch = kas.keterangan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         kas.kategori.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (kas.anggota?.nama && kas.anggota.nama.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (kas.anggota?.nickname && kas.anggota.nickname.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterJenis === 'all' || kas.jenis === filterJenis;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Kas</h1>
          <p className="text-gray-600">Kelola pemasukan dan pengeluaran kas Squad GCP</p>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <KasStats data={kasData} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => setError('')}
              className="text-red-600 hover:text-red-800 text-sm font-medium mt-2"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data kas...</p>
          </div>
        ) : (
          <>
            {/* Controls */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  {/* Search */}
                  <div className="flex-1 max-w-md">
                    <input
                      type="text"
                      placeholder="Cari keterangan, kategori, atau nama anggota..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  {/* Filter */}
                  <select
                    value={filterJenis}
                    onChange={(e) => setFilterJenis(e.target.value as 'all' | 'masuk' | 'keluar')}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Semua Jenis</option>
                    <option value="masuk">Kas Masuk</option>
                    <option value="keluar">Kas Keluar</option>
                  </select>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPembayaranBulanan(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    📊 Laporan Iuran
                  </button>
                  <button
                    onClick={() => setIsFormOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    + Tambah Kas
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <KasTable 
              data={filteredData}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </>
        )}

        {/* Form Modal */}
        {isFormOpen && (
          <KasForm
            kas={editingKas}
            onSubmit={editingKas ? handleUpdate : handleCreate}
            onCancel={handleCancelEdit}
          />
        )}

        {/* Pembayaran Bulanan Modal */}
        {showPembayaranBulanan && (
          <PembayaranBulananView
            onClose={() => setShowPembayaranBulanan(false)}
          />
        )}
      </div>
    </div>
  );
}
