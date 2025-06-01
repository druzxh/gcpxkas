import { useState, useEffect } from 'react';
import { Anggota, AnggotaFormData } from '@/types/anggota';
interface AnggotaFormProps {
  anggota?: Anggota | null;
  onSubmit: (data: AnggotaFormData) => void;
  onCancel: () => void;
}

export default function AnggotaForm({ anggota, onSubmit, onCancel }: AnggotaFormProps) {
  const [formData, setFormData] = useState<AnggotaFormData>({
    nama: '',
    email: '',
    telepon: '',
    status: 'aktif',
    role: '',
    nickname: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Role yang tersedia
  const roleOptions = [
    'Jungler',
    'Explaner',
    'Midlaner',
    'Goldlaner',
    'Support',
    'Roamer',
    'Lainnya',
  ];

  // Fill form jika editing
  useEffect(() => {
    if (anggota) {
      setFormData({
        nama: anggota.nama,
        email: anggota.email,
        telepon: anggota.telepon,
        status: anggota.status,
        role: anggota.role,
        nickname: anggota.nickname,
      });
    }
  }, [anggota]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama harus diisi';
    }

    if (!formData.nickname.trim()) {
      newErrors.nickname = 'Nickname harus diisi';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.telepon.trim()) {
      newErrors.telepon = 'Telepon harus diisi';
    }

    if (!formData.role) {
      newErrors.role = 'Role harus dipilih';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    console.log('handleSubmit called with formData:', formData);
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof AnggotaFormData, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error untuk field yang sedang diubah
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

    console.log('AnggotaForm initialized with formData:', formData);
    console.log('Errors:', errors);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {anggota ? 'Edit Anggota' : 'Tambah Anggota Baru'}
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
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nama */}
            <div className="">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap *
              </label>
              <input
                type="text"
                value={formData.nama}
                onChange={(e) => handleInputChange('nama', e.target.value)}
                placeholder="Masukkan nama lengkap"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.nama ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.nama && (
                <p className="text-red-500 text-xs mt-1">{errors.nama}</p>
              )}
            </div>
            {/* Nickname */}
            <div className="">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nickname *
              </label>
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) => handleInputChange('nickname', e.target.value)}
                placeholder="Masukkan nickname"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.nickname ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.nickname && (
                <p className="text-red-500 text-xs mt-1">{errors.nickname}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="nama@email.com"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Telepon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telepon *
              </label>
              <input
                type="tel"
                value={formData.telepon}
                onChange={(e) => handleInputChange('telepon', e.target.value)}
                placeholder="08xxxxxxxxxx"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.telepon ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.telepon && (
                <p className="text-red-500 text-xs mt-1">{errors.telepon}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.role ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Pilih role...</option>
                {roleOptions.map(role => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              {errors.role && (
                <p className="text-red-500 text-xs mt-1">{errors.role}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  formData.status === 'aktif'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}>
                  <input
                    type="radio"
                    value="aktif"
                    checked={formData.status === 'aktif'}
                    onChange={(e) => handleInputChange('status', e.target.value as 'aktif' | 'non-aktif')}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Aktif
                  </div>
                </label>
                <label className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  formData.status === 'non-aktif'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}>
                  <input
                    type="radio"
                    value="non-aktif"
                    checked={formData.status === 'non-aktif'}
                    onChange={(e) => handleInputChange('status', e.target.value as 'aktif' | 'non-aktif')}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Non-Aktif
                  </div>
                </label>
              </div>
            </div>
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
            {anggota ? 'Update' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}
