export interface Kas {
  id: string;
  tanggal: string;
  keterangan: string;
  jenis: 'masuk' | 'keluar';
  jumlah: number;
  kategori: string;
  createdAt: string;
  updatedAt: string;
}

export interface KasFormData {
  tanggal: string;
  keterangan: string;
  jenis: 'masuk' | 'keluar';
  jumlah: number;
  kategori: string;
}
