import { supabase } from '@/lib/supabase';
import { Kas, KasFormData } from '@/types/kas';

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
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  }

  static async create(userId: string, data: KasFormData): Promise<Kas> {
    const kasData = {
      user_id: userId,
      anggota_id: data.anggotaId || null,
      jenis: data.jenis,
      jumlah: data.jumlah,
      kategori: data.kategori,
      keterangan: data.keterangan,
      tanggal: data.tanggal,
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
    }, {} as Record<string, any>);

    return Object.values(ringkasan)
      .sort((a: any, b: any) => b.saldo - a.saldo);
  }
}
