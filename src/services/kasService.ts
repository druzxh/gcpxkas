import { supabase } from '@/lib/supabase';
import { Kas, KasFormData } from '@/types/kas';

export class KasService {
  static async getAll(userId: string): Promise<Kas[]> {
    const { data, error } = await supabase
      .from('kas')
      .select('*')
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
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  }

  static async create(userId: string, data: KasFormData): Promise<Kas> {
    const kasData = {
      user_id: userId,
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
      .select()
      .single();

    if (error) throw error;

    return {
      id: result.id,
      jenis: result.jenis,
      jumlah: result.jumlah,
      kategori: result.kategori,
      keterangan: result.keterangan,
      tanggal: result.tanggal,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    };
  }

  static async update(id: string, data: KasFormData): Promise<Kas> {
    const kasData = {
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
      .select()
      .single();

    if (error) throw error;

    return {
      id: result.id,
      jenis: result.jenis,
      jumlah: result.jumlah,
      kategori: result.kategori,
      keterangan: result.keterangan,
      tanggal: result.tanggal,
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
}
