'use client';

import { useState, useEffect } from 'react';
import { Anggota, AnggotaFormData } from '@/types/anggota';
import { useAuth } from '@/contexts/AuthContext';
import { AnggotaService } from '@/services/anggotaService';
import AnggotaTable from '@/components/anggota/AnggotaTable';
import AnggotaForm from '@/components/anggota/AnggotaForm';
import AnggotaStats from '@/components/anggota/AnggotaStats';

export default function AnggotaPage() {
  const { user } = useAuth();
  const [anggotaData, setAnggotaData] = useState<Anggota[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAnggota, setEditingAnggota] = useState<Anggota | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'aktif' | 'non-aktif'>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load data from Supabase
  useEffect(() => {
    if (user) {
      loadAnggotaData();
    }
  }, [user]);

  const loadAnggotaData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await AnggotaService.getAll(user.id);
      setAnggotaData(data);
    } catch (err) {
      setError('Gagal memuat data anggota');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData: AnggotaFormData) => {
    if (!user) return;
    
    try {
      const newAnggota = await AnggotaService.create(user.id, formData);
      setAnggotaData([newAnggota, ...anggotaData]);
      setIsFormOpen(false);
    } catch (err) {
      setError('Gagal menambah data anggota');
      console.error(err);
    }
  };

  const handleUpdate = async (formData: AnggotaFormData) => {
    if (!editingAnggota) return;
    
    try {
      const updatedAnggota = await AnggotaService.update(editingAnggota.id, formData);
      setAnggotaData(anggotaData.map(anggota => anggota.id === editingAnggota.id ? updatedAnggota : anggota));
      setEditingAnggota(null);
      setIsFormOpen(false);
    } catch (err) {
      setError('Gagal mengupdate data anggota');
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data anggota ini?')) {
      try {
        await AnggotaService.delete(id);
        setAnggotaData(anggotaData.filter(anggota => anggota.id !== id));
      } catch (err) {
        setError('Gagal menghapus data anggota');
        console.error(err);
      }
    }
  };

  const handleEdit = (anggota: Anggota) => {
    setEditingAnggota(anggota);
    setIsFormOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingAnggota(null);
    setIsFormOpen(false);
  };

  // Get unique roles for filter
  const roles = Array.from(new Set(anggotaData.map(a => a.role))).sort();

  // Filter dan search data
  const filteredData = anggotaData.filter(anggota => {
    const matchesSearch = anggota.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         anggota.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         anggota.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         anggota.nickname.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || anggota.status === filterStatus;
    const matchesRole = filterRole === 'all' || anggota.role === filterRole;
    return matchesSearch && matchesStatus && matchesRole;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Anggota</h1>
          <p className="text-gray-600">Kelola data anggota organisasi atau perusahaan</p>
        </div>

        {/* Stats */}
        <AnggotaStats data={anggotaData} />

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
            <p className="text-gray-600">Memuat data anggota...</p>
          </div>
        ) : (
          <>
            {/* Controls */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Cari nama, email, atau role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Filter Status */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'aktif' | 'non-aktif')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="non-aktif">Non-Aktif</option>
              </select>

              {/* Filter Role */}
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Role</option>
                {roles.map(role => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Add Button */}
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              + Tambah Anggota
            </button>            </div>
          </div>

            {/* Table */}
            <AnggotaTable 
              data={filteredData}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </>
        )}

        {/* Form Modal */}
        {isFormOpen && (
          <AnggotaForm
            anggota={editingAnggota}
            onSubmit={editingAnggota ? handleUpdate : handleCreate}
            onCancel={handleCancelEdit}
          />
        )}
      </div>
    </div>
  );
}
