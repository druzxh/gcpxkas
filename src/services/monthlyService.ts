import { Kas } from '@/types/kas';
import { Anggota } from '@/types/anggota';
import { MonthlyData, AnggotaMonthly, MonthlyStats } from '@/types/monthly';

export class MonthlyService {
  private static readonly TARGET_PEMASUKAN_PER_BULAN = 100000; // Total target per bulan
  private static readonly PERIODE_START = "2025-05"; // Mei 2025
  private static readonly PERIODE_END = "2025-12"; // Desember 2025

  // Fungsi untuk mendapatkan target per anggota berdasarkan jumlah anggota
  private static getTargetPerAnggota(jumlahAnggota: number): number {
    return Math.ceil(this.TARGET_PEMASUKAN_PER_BULAN / jumlahAnggota);
  }

  // Fungsi untuk mendapatkan data bulanan
  static getMonthlyData(
    kasData: Kas[], 
    anggotaData: Anggota[], 
    targetMonth: string // Format: "2025-08"
  ): MonthlyData {
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    const [year, month] = targetMonth.split('-');
    const monthIndex = parseInt(month) - 1;
    const monthName = `${monthNames[monthIndex]} ${year}`;

    // Filter transaksi iuran untuk bulan yang ditentukan
    const monthlyTransactions = kasData.filter(kas => {
      const kasMonth = kas.tanggal.substring(0, 7); // Ambil YYYY-MM
      return kasMonth === targetMonth && 
             kas.jenis === 'masuk' && 
             kas.kategori.toLowerCase().includes('iuran') &&
             kas.anggotaId; // Pastikan ada anggotaId
    });

    // Dapatkan data sisa dari bulan sebelumnya
    const previousMonthData = this.getPreviousMonthSisa(kasData, anggotaData, targetMonth);

    // Hitung berapa bulan yang sudah berlalu sejak periode start
    const monthsFromStart = this.getMonthsFromPeriodeStart(targetMonth);
    const targetPerAnggota = this.getTargetPerAnggota(anggotaData.length);
    const targetIuranSampaiSekarang = monthsFromStart * targetPerAnggota;

    const anggotaMonthly: AnggotaMonthly[] = anggotaData.map(anggota => {
      // Hitung total iuran yang dibayar anggota bulan ini
      const iuranBulanIni = monthlyTransactions
        .filter(kas => kas.anggotaId === anggota.id)
        .reduce((sum, kas) => sum + kas.jumlah, 0);

      // Ambil sisa dari bulan sebelumnya
      const sisaSebelumnya = previousMonthData[anggota.id] || 0;

      // Hitung total yang sudah terbayar
      const totalTerbayar = iuranBulanIni + sisaSebelumnya;

      // Hitung kelebihan atau kekurangan berdasarkan target bulan ini
      let keSisaBerikutnya = 0;
      let status: 'lunas' | 'kurang' | 'lebih' = 'lunas';
      let kekuranganAtauKelebihan = 0;

      if (totalTerbayar > targetPerAnggota) {
        // Lebih bayar - sisa masuk ke bulan berikutnya
        keSisaBerikutnya = totalTerbayar - targetPerAnggota;
        status = 'lebih';
        kekuranganAtauKelebihan = keSisaBerikutnya;
      } else if (totalTerbayar < targetPerAnggota) {
        // Kurang bayar - akan jadi minus untuk bulan berikutnya
        keSisaBerikutnya = totalTerbayar - targetPerAnggota; // Akan negatif
        status = 'kurang';
        kekuranganAtauKelebihan = keSisaBerikutnya; // Nilai negatif
      }

      return {
        id: anggota.id,
        nama: anggota.nama,
        nickname: anggota.nickname,
        iuranBulanIni,
        sisaSebelumnya,
        totalTerbayar,
        keSisaBerikutnya,
        status,
        kekuranganAtauKelebihan,
        // Data tambahan untuk tracking periode
        targetIuranSampaiSekarang,
        totalIuranFromStart: this.getTotalIuranFromStart(kasData, anggota.id, targetMonth),
        progressToTarget: 0 // akan dihitung setelah ini
      };
    });

    // Hitung progress untuk setiap anggota
    anggotaMonthly.forEach(anggota => {
      if (anggota.targetIuranSampaiSekarang && anggota.targetIuranSampaiSekarang > 0) {
        anggota.progressToTarget = Math.round(
          ((anggota.totalIuranFromStart || 0) / anggota.targetIuranSampaiSekarang) * 100
        );
      }
    });

    // Hitung totals
    const totalIuran = anggotaMonthly.reduce((sum, a) => sum + a.iuranBulanIni, 0);
    const totalSisaSebelumnya = anggotaMonthly.reduce((sum, a) => sum + a.sisaSebelumnya, 0);
    const totalKeSisaBerikutnya = anggotaMonthly.reduce((sum, a) => sum + a.keSisaBerikutnya, 0);

    return {
      month: targetMonth,
      monthName,
      anggota: anggotaMonthly,
      totalIuran,
      totalSisaSebelumnya,
      totalKeSisaBerikutnya,
      targetPemasukanBulan: this.TARGET_PEMASUKAN_PER_BULAN,
      targetPerAnggota
    };
  }

  // Fungsi untuk menghitung berapa bulan dari periode start
  private static getMonthsFromPeriodeStart(targetMonth: string): number {
    const [startYear, startMonth] = this.PERIODE_START.split('-').map(Number);
    const [targetYear, targetMonthNum] = targetMonth.split('-').map(Number);
    
    const startDate = new Date(startYear, startMonth - 1);
    const targetDate = new Date(targetYear, targetMonthNum - 1);
    
    const months = (targetDate.getFullYear() - startDate.getFullYear()) * 12 + 
                   (targetDate.getMonth() - startDate.getMonth()) + 1;
    
    return Math.max(1, months);
  }

  // Fungsi untuk mendapatkan total iuran dari awal periode
  private static getTotalIuranFromStart(kasData: Kas[], anggotaId: string, targetMonth: string): number {
    const [targetYear, targetMonthNum] = targetMonth.split('-').map(Number);
    const [startYear, startMonth] = this.PERIODE_START.split('-').map(Number);
    
    let total = 0;
    const currentDate = new Date(startYear, startMonth - 1);
    const endDate = new Date(targetYear, targetMonthNum - 1);
    endDate.setMonth(endDate.getMonth() + 1); // Include target month
    
    while (currentDate < endDate) {
      const monthString = currentDate.toISOString().substring(0, 7);
      
      const monthlyIuran = kasData
        .filter(kas => {
          const kasMonth = kas.tanggal.substring(0, 7);
          return kasMonth === monthString && 
                 kas.jenis === 'masuk' && 
                 kas.kategori.toLowerCase().includes('iuran') &&
                 kas.anggotaId === anggotaId;
        })
        .reduce((sum, kas) => sum + kas.jumlah, 0);
      
      total += monthlyIuran;
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return total;
  }

  // Fungsi untuk mendapatkan sisa dari bulan sebelumnya
  private static getPreviousMonthSisa(
    kasData: Kas[], 
    anggotaData: Anggota[], 
    currentMonth: string
  ): { [anggotaId: string]: number } {
    const [year, month] = currentMonth.split('-');
    const currentDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    
    // Hitung untuk semua bulan sebelumnya
    const sisaData: { [anggotaId: string]: number } = {};
    
    // Inisialisasi dengan 0 untuk semua anggota
    anggotaData.forEach(anggota => {
      sisaData[anggota.id] = 0;
    });

    // Hitung sisa untuk setiap bulan dari periode start sampai bulan sebelum currentMonth
    const [startYear, startMonth] = this.PERIODE_START.split('-').map(Number);
    const startDate = new Date(startYear, startMonth - 1, 1);
    const iterDate = new Date(startDate);

    while (iterDate < currentDate) {
      const iterMonth = iterDate.toISOString().substring(0, 7);
      
      // Filter transaksi untuk bulan ini
      const monthTransactions = kasData.filter(kas => {
        const kasMonth = kas.tanggal.substring(0, 7);
        return kasMonth === iterMonth && 
               kas.jenis === 'masuk' && 
               kas.kategori.toLowerCase().includes('iuran') &&
               kas.anggotaId;
      });

      // Update sisa untuk setiap anggota
      anggotaData.forEach(anggota => {
        const targetPerAnggota = this.getTargetPerAnggota(anggotaData.length);
        const iuranBulanIni = monthTransactions
          .filter(kas => kas.anggotaId === anggota.id)
          .reduce((sum, kas) => sum + kas.jumlah, 0);

        const totalTerbayar = iuranBulanIni + sisaData[anggota.id];
        
        // Update sisa untuk bulan berikutnya
        if (totalTerbayar !== targetPerAnggota) {
          sisaData[anggota.id] = totalTerbayar - targetPerAnggota;
        } else {
          sisaData[anggota.id] = 0;
        }
      });

      // Pindah ke bulan berikutnya
      iterDate.setMonth(iterDate.getMonth() + 1);
    }

    return sisaData;
  }

  // Fungsi untuk mendapatkan statistik bulanan
  static getMonthlyStats(monthlyData: MonthlyData): MonthlyStats {
    const stats = monthlyData.anggota.reduce((acc, anggota) => {
      switch (anggota.status) {
        case 'lunas':
          acc.totalAnggotaLunas++;
          break;
        case 'kurang':
          acc.totalAnggotaKurang++;
          acc.totalKekurangan += Math.abs(anggota.kekuranganAtauKelebihan);
          break;
        case 'lebih':
          acc.totalAnggotaLebih++;
          acc.totalKelebihan += anggota.kekuranganAtauKelebihan;
          break;
      }
      acc.totalIuranTerkumpul += anggota.iuranBulanIni;
      return acc;
    }, {
      totalAnggotaLunas: 0,
      totalAnggotaKurang: 0,
      totalAnggotaLebih: 0,
      totalIuranTerkumpul: 0,
      totalKekurangan: 0,
      totalKelebihan: 0
    });

    return stats;
  }

  // Fungsi untuk mendapatkan list bulan yang tersedia
  static getAvailableMonths(kasData: Kas[]): string[] {
    const months = new Set<string>();
    
    kasData.forEach(kas => {
      if (kas.jenis === 'masuk' && kas.kategori.toLowerCase().includes('iuran')) {
        const month = kas.tanggal.substring(0, 7);
        months.add(month);
      }
    });

    // Tambahkan bulan saat ini jika belum ada
    const currentMonth = new Date().toISOString().substring(0, 7);
    months.add(currentMonth);

    return Array.from(months).sort();
  }

  // Format currency
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  // Public methods untuk mendapatkan target
  static getTargetPemasukanPerBulan(): number {
    return this.TARGET_PEMASUKAN_PER_BULAN;
  }

  static getTargetPerAnggotaPublic(jumlahAnggota: number): number {
    return this.getTargetPerAnggota(jumlahAnggota);
  }
}
