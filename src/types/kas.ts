export interface Kas {
  id: string;
  tanggal: string;
  keterangan: string;
  jenis: 'masuk' | 'keluar';
  jumlah: number;
  kategori: string;
  anggotaId?: string | null;
  anggota?: {
    id: string;
    nama: string;
    nickname: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface KasFormData {
  tanggal: string;
  keterangan: string;
  jenis: 'masuk' | 'keluar';
  jumlah: number;
  kategori: string;
  anggotaId?: string | null;
}
