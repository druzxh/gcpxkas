import { supabase } from '@/lib/supabase';
import { Anggota, AnggotaFormData } from '@/types/anggota';

export class AnggotaService {
  static async getAll(userId: string): Promise<Anggota[]> {
    const { data, error } = await supabase
      .from('anggota')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      nama: item.nama,
      email: item.email,
      telepon: item.telepon,
      status: item.status,
      role: item.role,
      nickname: item.nickname,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  }

  static async create(userId: string, data: AnggotaFormData): Promise<Anggota> {
    const anggotaData = {
      user_id: userId,
      nama: data.nama,
      email: data.email,
      telepon: data.telepon,
      status: data.status,
      role: data.role,
      nickname: data.nickname,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: result, error } = await supabase
      .from('anggota')
      .insert(anggotaData)
      .select()
      .single();

    if (error) throw error;

    return {
      id: result.id,
      nama: result.nama,
      email: result.email,
      telepon: result.telepon,
      status: result.status,
      role: result.role,
      nickname: result.nickname,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    };
  }

  static async update(id: string, data: AnggotaFormData): Promise<Anggota> {
    const anggotaData = {
      nama: data.nama,
      email: data.email,
      telepon: data.telepon,
      status: data.status,
      role: data.role,
      nickname: data.nickname,
      updated_at: new Date().toISOString(),
    };

    const { data: result, error } = await supabase
      .from('anggota')
      .update(anggotaData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: result.id,
      nama: result.nama,
      email: result.email,
      telepon: result.telepon,
      status: result.status,
      role: result.role,
      nickname: result.nickname,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    };
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('anggota')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
