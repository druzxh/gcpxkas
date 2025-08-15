import { BulanOption } from '@/types/kas';

export class MonthUtils {
  /**
   * Generate options bulan untuk dropdown (6 bulan ke belakang, bulan ini, sampai akhir tahun ini)
   */
  static generateBulanOptions(): BulanOption[] {
    const options: BulanOption[] = [];
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-11

    // Generate dari 6 bulan ke belakang sampai akhir tahun ini (Desember)
    const monthsToEnd = 11 - currentMonth; // Bulan yang tersisa sampai Desember
    const endRange = Math.max(1, monthsToEnd); // Minimal 1 bulan ke depan
    
    for (let i = -6; i <= endRange; i++) {
      const targetDate = new Date(currentYear, currentMonth + i, 1);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth(); // 0-11
      
      const value = `${year}-${String(month + 1).padStart(2, '0')}`;
      const label = this.formatBulanLabel(year, month);
      
      const isPast = i < 0;
      const isCurrent = i === 0;
      const isFuture = i > 0;

      options.push({
        value,
        label,
        isPast,
        isCurrent,
        isFuture
      });
    }

    return options;
  }

  /**
   * Format bulan menjadi label yang readable
   */
  static formatBulanLabel(year: number, month: number): string {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    return `${months[month]} ${year}`;
  }

  /**
   * Parse month string (2025-08) menjadi label
   */
  static parseBulanToLabel(monthStr: string): string {
    const [year, month] = monthStr.split('-');
    return this.formatBulanLabel(parseInt(year), parseInt(month) - 1);
  }

  /**
   * Get current month string
   */
  static getCurrentMonth(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // 1-12
    return `${year}-${String(month).padStart(2, '0')}`;
  }

  /**
   * Check apakah bulan yang dipilih adalah bulan ini
   */
  static isCurrentMonth(monthStr: string): boolean {
    return monthStr === this.getCurrentMonth();
  }

  /**
   * Check apakah bulan yang dipilih adalah bulan masa lalu
   */
  static isPastMonth(monthStr: string): boolean {
    const currentMonth = this.getCurrentMonth();
    return monthStr < currentMonth;
  }

  /**
   * Check apakah bulan yang dipilih adalah bulan depan
   */
  static isFutureMonth(monthStr: string): boolean {
    const currentMonth = this.getCurrentMonth();
    return monthStr > currentMonth;
  }

  /**
   * Generate keterangan otomatis untuk pembayaran iuran
   */
  static generateKeteranganIuran(anggotaNama: string, bulan: string, jumlah: number): string {
    const bulanLabel = this.parseBulanToLabel(bulan);
    return `Iuran ${bulanLabel} - ${anggotaNama} (Rp ${jumlah.toLocaleString('id-ID')})`;
  }
}
