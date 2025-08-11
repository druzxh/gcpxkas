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
  bulanPembayaran?: string | null; // Format: "2025-08" untuk pembayaran iuran bulanan
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
  bulanPembayaran?: string | null; // Field untuk pembayaran iuran bulanan
}

// Interface untuk validasi pembayaran bulanan
export interface PembayaranBulanan {
  anggotaId: string;
  bulan: string; // Format: "2025-08"
  sudahBayar: boolean;
  jumlahBayar: number;
  tanggalBayar?: string;
}

// Interface untuk dropdown options bulan
export interface BulanOption {
  value: string; // "2025-08"
  label: string; // "Agustus 2025"
  isPast: boolean; // Apakah bulan ini sudah lewat
  isCurrent: boolean; // Apakah bulan ini adalah bulan sekarang
  isFuture: boolean; // Apakah bulan ini adalah bulan depan
}
