'use client';

import { useState, useEffect } from 'react';
import { Anggota, AnggotaFormData } from '@/types/anggota';
import AnggotaTable from '@/components/anggota/AnggotaTable';
import AnggotaForm from '@/components/anggota/AnggotaForm';
import AnggotaStats from '@/components/anggota/AnggotaStats';

export default function AnggotaPage() {
  const [anggotaData, setAnggotaData] = useState<Anggota[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAnggota, setEditingAnggota] = useState<Anggota | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'aktif' | 'non-aktif'>('all');

  // Load data dari localStorage saat komponen dimount
  useEffect(() => {
    const savedData = localStorage.getItem('anggotaData');
    if (savedData) {
      setAnggotaData(JSON.parse(savedData));
    }
  }, []);

  // Save data ke localStorage setiap kali anggotaData berubah
  useEffect(() => {
    localStorage.setItem('anggotaData', JSON.stringify(anggotaData));
  }, [anggotaData]);

  const handleCreate = (formData: AnggotaFormData) => {
    const newAnggota: Anggota = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAnggotaData([...anggotaData, newAnggota]);
    setIsFormOpen(false);
  };

  const handleUpdate = (formData: AnggotaFormData) => {
    if (!editingAnggota) return;
    
    const updatedAnggota: Anggota = {
      ...editingAnggota,
      ...formData,
      updatedAt: new Date().toISOString(),
    };
    
    setAnggotaData(anggotaData.map(anggota => anggota.id === editingAnggota.id ? updatedAnggota : anggota));
    setEditingAnggota(null);
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data anggota ini?')) {
      setAnggotaData(anggotaData.filter(anggota => anggota.id !== id));
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

  // Filter dan search data
  const filteredData = anggotaData.filter(anggota => {
    const matchesSearch = anggota.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         anggota.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         anggota.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || anggota.status === filterStatus;
    return matchesSearch && matchesStatus;
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
            </div>
            
            {/* Add Button */}
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              + Tambah Anggota
            </button>
          </div>
        </div>

        {/* Table */}
        <AnggotaTable 
          data={filteredData}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

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
