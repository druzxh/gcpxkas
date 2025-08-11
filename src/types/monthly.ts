export interface MonthlyData {
  month: string; // Format: "2025-08"
  monthName: string; // Format: "Agustus 2025"
  anggota: AnggotaMonthly[];
  totalIuran: number;
  totalSisaSebelumnya: number;
  totalKeSisaBerikutnya: number;
  targetPemasukanBulan: number; // Target total pemasukan per bulan
  targetPerAnggota: number; // Target per anggota
}

export interface AnggotaMonthly {
  id: string;
  nama: string;
  nickname: string;
  iuranBulanIni: number; // Iuran yang dibayar bulan ini
  sisaSebelumnya: number; // Sisa dari bulan sebelumnya
  totalTerbayar: number; // Total yang sudah terbayar (iuran + sisa sebelumnya)
  keSisaBerikutnya: number; // Yang akan diteruskan ke bulan berikutnya
  status: 'lunas' | 'kurang' | 'lebih'; // Status pembayaran
  kekuranganAtauKelebihan: number; // Jumlah kekurangan (-) atau kelebihan (+)
  // Data tambahan untuk tracking periode
  targetIuranSampaiSekarang?: number; // Target iuran dari awal periode sampai bulan ini
  totalIuranFromStart?: number; // Total iuran yang sudah dibayar dari awal periode
  progressToTarget?: number; // Progress menuju target dalam persen
}

export interface MonthlyStats {
  totalAnggotaLunas: number;
  totalAnggotaKurang: number;
  totalAnggotaLebih: number;
  totalIuranTerkumpul: number;
  totalKekurangan: number;
  totalKelebihan: number;
}
