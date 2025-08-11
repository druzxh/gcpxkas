import { useState, useEffect } from 'react';
import { Kas, KasFormData } from '@/types/kas';
import { Anggota } from '@/types/anggota';
import { AnggotaService } from '@/services/anggotaService';
import { useAuth } from '@/contexts/AuthContext';

interface KasFormProps {
  kas?: Kas | null;
  onSubmit: (data: KasFormData) => void;
  onCancel: () => void;
}

export default function KasForm({ kas, onSubmit, onCancel }: KasFormProps) {
  const { user } = useAuth();
  const [anggotaList, setAnggotaList] = useState<Anggota[]>([]);
  const [formData, setFormData] = useState<KasFormData>({
    tanggal: new Date().toISOString().split('T')[0],
    keterangan: '',
    jenis: 'masuk',
    jumlah: 0,
    kategori: '',
    anggotaId: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Kategori yang tersedia
  const kategoriOptions = [
    'Tabungan',
    'Operasional',
    'Gaji',
    'Penjualan',
    'Pembelian',
    'Investasi',
    'Pinjaman',
    'Utilitas',
    'Marketing',
    'Transportasi',
    'Maintenance',
    'Lainnya',
  ];

  // Load anggota list saat component mount
  useEffect(() => {
    const loadAnggota = async () => {
      if (user) {
        try {
          const data = await AnggotaService.getAll(user.id);
          setAnggotaList(data.filter(anggota => anggota.status === 'aktif'));
        } catch (error) {
          console.error('Error loading anggota:', error);
        }
      }
    };
    loadAnggota();
  }, [user]);

  // Fill form jika editing
  useEffect(() => {
    if (kas) {
      setFormData({
        tanggal: kas.tanggal,
        keterangan: kas.keterangan,
        jenis: kas.jenis,
        jumlah: kas.jumlah,
        kategori: kas.kategori,
        anggotaId: kas.anggotaId || null,
      });
    }
  }, [kas]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.tanggal) {
      newErrors.tanggal = 'Tanggal harus diisi';
    }

    if (!formData.keterangan.trim()) {
      newErrors.keterangan = 'Keterangan harus diisi';
    }

    if (formData.jumlah <= 0) {
      newErrors.jumlah = 'Jumlah harus lebih dari 0';
    }

    if (!formData.kategori) {
      newErrors.kategori = 'Kategori harus dipilih';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof KasFormData, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error untuk field yang sedang diubah
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {kas ? 'Edit Kas' : 'Tambah Kas Baru'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Tanggal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal *
            </label>
            <input
              type="date"
              value={formData.tanggal}
              onChange={(e) => handleInputChange('tanggal', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.tanggal ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.tanggal && (
              <p className="text-red-500 text-xs mt-1">{errors.tanggal}</p>
            )}
          </div>

          {/* Jenis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jenis Transaksi *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                formData.jenis === 'masuk'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  value="masuk"
                  checked={formData.jenis === 'masuk'}
                  onChange={(e) => handleInputChange('jenis', e.target.value as 'masuk' | 'keluar')}
                  className="sr-only"
                />
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path>
                  </svg>
                  Kas Masuk
                </div>
              </label>
              <label className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                formData.jenis === 'keluar'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  value="keluar"
                  checked={formData.jenis === 'keluar'}
                  onChange={(e) => handleInputChange('jenis', e.target.value as 'masuk' | 'keluar')}
                  className="sr-only"
                />
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"></path>
                  </svg>
                  Kas Keluar
                </div>
              </label>
            </div>
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategori *
            </label>
            <select
              value={formData.kategori}
              onChange={(e) => handleInputChange('kategori', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.kategori ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Pilih kategori...</option>
              {kategoriOptions.map(kategori => (
                <option key={kategori} value={kategori}>
                  {kategori}
                </option>
              ))}
            </select>
            {errors.kategori && (
              <p className="text-red-500 text-xs mt-1">{errors.kategori}</p>
            )}
          </div>

          {/* Anggota */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anggota (Opsional)
            </label>
            <select
              value={formData.anggotaId || ''}
              onChange={(e) => handleInputChange('anggotaId', e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tidak terkait dengan anggota</option>
              {anggotaList.map(anggota => (
                <option key={anggota.id} value={anggota.id}>
                  {anggota.nama} ({anggota.nickname})
                </option>
              ))}
            </select>
            <p className="text-gray-500 text-xs mt-1">
              Pilih anggota jika transaksi ini terkait dengan anggota tertentu
            </p>
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keterangan *
            </label>
            <textarea
              value={formData.keterangan}
              onChange={(e) => handleInputChange('keterangan', e.target.value)}
              placeholder="Masukkan keterangan transaksi..."
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                errors.keterangan ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.keterangan && (
              <p className="text-red-500 text-xs mt-1">{errors.keterangan}</p>
            )}
          </div>

          {/* Jumlah */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jumlah (IDR) *
            </label>
            <input
              type="number"
              value={formData.jumlah || ''}
              onChange={(e) => handleInputChange('jumlah', parseFloat(e.target.value) || 0)}
              placeholder="0"
              min="0"
              step="1000"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.jumlah ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.jumlah && (
              <p className="text-red-500 text-xs mt-1">{errors.jumlah}</p>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Batal
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {kas ? 'Update' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}
