import { supabase } from '@/lib/supabase';
import { Kas, KasFormData, PembayaranBulanan } from '@/types/kas';
import { MonthUtils } from '@/lib/monthUtils';

interface RingkasanKeterangan {
  keterangan: string;
  pemasukan: number;
  pengeluaran: number;
  saldo: number;
  kategori: string;
}

export class KasService {
  static async getAll(userId: string): Promise<Kas[]> {
    const { data, error } = await supabase
      .from('kas')
      .select(`
        *,
        anggota:anggota_id (
          id,
          nama,
          nickname
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      jenis: item.jenis,
      jumlah: item.jumlah,
      kategori: item.kategori,
      keterangan: item.keterangan,
      tanggal: item.tanggal,
      anggotaId: item.anggota_id,
      anggota: item.anggota,
      bulanPembayaran: item.bulan_pembayaran,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  }

  static async create(userId: string, data: KasFormData): Promise<Kas> {
    // Validasi pembayaran bulanan jika ada
    if (data.anggotaId && data.bulanPembayaran) {
      const sudahBayar = await this.checkPembayaranBulanan(userId, data.anggotaId, data.bulanPembayaran);
      
      // Jika bulan ini dan sudah bayar 20rb, tidak boleh bayar lagi
      if (MonthUtils.isCurrentMonth(data.bulanPembayaran) && sudahBayar.sudahBayar && sudahBayar.jumlahBayar >= 20000) {
        throw new Error(`Anggota ini sudah membayar iuran untuk ${MonthUtils.parseBulanToLabel(data.bulanPembayaran)} sebesar Rp ${sudahBayar.jumlahBayar.toLocaleString('id-ID')}. Tidak dapat menambah pembayaran untuk bulan yang sama.`);
      }
    }

    const kasData = {
      user_id: userId,
      anggota_id: data.anggotaId || null,
      jenis: data.jenis,
      jumlah: data.jumlah,
      kategori: data.kategori,
      keterangan: data.keterangan,
      tanggal: data.tanggal,
      bulan_pembayaran: data.bulanPembayaran || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: result, error } = await supabase
      .from('kas')
      .insert(kasData)
      .select(`
        *,
        anggota:anggota_id (
          id,
          nama,
          nickname
        )
      `)
      .single();

    if (error) throw error;

    return {
      id: result.id,
      jenis: result.jenis,
      jumlah: result.jumlah,
      kategori: result.kategori,
      keterangan: result.keterangan,
      tanggal: result.tanggal,
      anggotaId: result.anggota_id,
      anggota: result.anggota,
      bulanPembayaran: result.bulan_pembayaran,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    };
  }

  static async update(id: string, data: KasFormData): Promise<Kas> {
    const kasData = {
      anggota_id: data.anggotaId || null,
      jenis: data.jenis,
      jumlah: data.jumlah,
      kategori: data.kategori,
      keterangan: data.keterangan,
      tanggal: data.tanggal,
      bulan_pembayaran: data.bulanPembayaran || null,
      updated_at: new Date().toISOString(),
    };

    const { data: result, error } = await supabase
      .from('kas')
      .update(kasData)
      .eq('id', id)
      .select(`
        *,
        anggota:anggota_id (
          id,
          nama,
          nickname
        )
      `)
      .single();

    if (error) throw error;

    return {
      id: result.id,
      jenis: result.jenis,
      jumlah: result.jumlah,
      kategori: result.kategori,
      keterangan: result.keterangan,
      tanggal: result.tanggal,
      anggotaId: result.anggota_id,
      anggota: result.anggota,
      bulanPembayaran: result.bulan_pembayaran,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    };
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('kas')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getRingkasanPerAnggota(userId: string) {
    const { data, error } = await supabase
      .from('kas')
      .select(`
        *,
        anggota:anggota_id (
          id,
          nama,
          nickname
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;

    // Group by anggota
    const ringkasan = data.reduce((acc, kas) => {
      const anggotaKey = kas.anggota?.nama || 'Tanpa Anggota';
      const anggotaId = kas.anggota?.id || 'no-anggota';
      
      if (!acc[anggotaKey]) {
        acc[anggotaKey] = {
          id: anggotaId,
          nama: anggotaKey,
          nickname: kas.anggota?.nickname || '',
          totalMasuk: 0,
          totalKeluar: 0,
          saldo: 0,
          jumlahTransaksi: 0,
          transaksi: []
        };
      }
      
      if (kas.jenis === 'masuk') {
        acc[anggotaKey].totalMasuk += kas.jumlah;
      } else {
        acc[anggotaKey].totalKeluar += kas.jumlah;
      }
      
      acc[anggotaKey].saldo = acc[anggotaKey].totalMasuk - acc[anggotaKey].totalKeluar;
      acc[anggotaKey].jumlahTransaksi += 1;
      acc[anggotaKey].transaksi.push({
        id: kas.id,
        tanggal: kas.tanggal,
        keterangan: kas.keterangan,
        jenis: kas.jenis,
        jumlah: kas.jumlah,
        kategori: kas.kategori,
      });
      
      return acc;
    }, {} as Record<string, RingkasanKeterangan>);

    return (Object.values(ringkasan) as RingkasanKeterangan[])
      .sort((a: RingkasanKeterangan, b: RingkasanKeterangan) => b.saldo - a.saldo);
  }

  /**
   * Check apakah anggota sudah membayar untuk bulan tertentu
   */
  static async checkPembayaranBulanan(userId: string, anggotaId: string, bulan: string): Promise<PembayaranBulanan> {
    const { data, error } = await supabase
      .from('kas')
      .select('*')
      .eq('user_id', userId)
      .eq('anggota_id', anggotaId)
      .eq('bulan_pembayaran', bulan)
      .eq('jenis', 'masuk');

    if (error) throw error;

    const totalBayar = data.reduce((sum, kas) => sum + kas.jumlah, 0);
    const tanggalBayarTerakhir = data.length > 0 ? data[data.length - 1].tanggal : undefined;

    return {
      anggotaId,
      bulan,
      sudahBayar: totalBayar > 0,
      jumlahBayar: totalBayar,
      tanggalBayar: tanggalBayarTerakhir
    };
  }

  /**
   * Get semua pembayaran bulanan untuk semua anggota
   */
  static async getPembayaranBulananByMonth(userId: string, bulan: string): Promise<PembayaranBulanan[]> {
    const { data, error } = await supabase
      .from('kas')
      .select(`
        *,
        anggota:anggota_id (
          id,
          nama,
          nickname
        )
      `)
      .eq('user_id', userId)
      .eq('bulan_pembayaran', bulan)
      .eq('jenis', 'masuk');

    if (error) throw error;

    // Group by anggota
    const pembayaranMap = new Map<string, PembayaranBulanan>();
    
    data.forEach(kas => {
      const anggotaId = kas.anggota_id;
      if (!pembayaranMap.has(anggotaId)) {
        pembayaranMap.set(anggotaId, {
          anggotaId,
          bulan,
          sudahBayar: false,
          jumlahBayar: 0,
        });
      }
      
      const pembayaran = pembayaranMap.get(anggotaId)!;
      pembayaran.jumlahBayar += kas.jumlah;
      pembayaran.sudahBayar = true;
      pembayaran.tanggalBayar = kas.tanggal;
    });

    return Array.from(pembayaranMap.values());
  }
}
