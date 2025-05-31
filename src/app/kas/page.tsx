'use client';

import { useState, useEffect } from 'react';
import { Kas, KasFormData } from '@/types/kas';
import KasTable from '@/components/kas/KasTable';
import KasForm from '@/components/kas/KasForm';

export default function KasPage() {
  const [kasData, setKasData] = useState<Kas[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingKas, setEditingKas] = useState<Kas | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJenis, setFilterJenis] = useState<'all' | 'masuk' | 'keluar'>('all');

  // Load data dari localStorage saat komponen dimount
  useEffect(() => {
    const savedData = localStorage.getItem('kasData');
    if (savedData) {
      setKasData(JSON.parse(savedData));
    }
  }, []);

  // Save data ke localStorage setiap kali kasData berubah
  useEffect(() => {
    localStorage.setItem('kasData', JSON.stringify(kasData));
  }, [kasData]);

  const handleCreate = (formData: KasFormData) => {
    const newKas: Kas = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setKasData([...kasData, newKas]);
    setIsFormOpen(false);
  };

  const handleUpdate = (formData: KasFormData) => {
    if (!editingKas) return;
    
    const updatedKas: Kas = {
      ...editingKas,
      ...formData,
      updatedAt: new Date().toISOString(),
    };
    
    setKasData(kasData.map(kas => kas.id === editingKas.id ? updatedKas : kas));
    setEditingKas(null);
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data kas ini?')) {
      setKasData(kasData.filter(kas => kas.id !== id));
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
                         kas.kategori.toLowerCase().includes(searchTerm.toLowerCase());
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
        {/* <KasStats data={kasData} /> */}

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Cari keterangan atau kategori..."
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
            
            {/* Add Button */}
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              + Tambah Kas
            </button>
          </div>
        </div>

        {/* Table */}
        <KasTable 
          data={filteredData}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Form Modal */}
        {isFormOpen && (
          <KasForm
            kas={editingKas}
            onSubmit={editingKas ? handleUpdate : handleCreate}
            onCancel={handleCancelEdit}
          />
        )}
      </div>
    </div>
  );
}
