export interface Anggota {
  id: string;
  nama: string;
  email: string;
  telepon: string;
  status: 'aktif' | 'non-aktif';
  role: string;
  nickname: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnggotaFormData {
  nama: string;
  email: string;
  telepon: string;
  status: 'aktif' | 'non-aktif';
  role: string;
  nickname: string;
}
