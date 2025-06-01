import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      kas: {
        Row: {
          id: string
          user_id: string
          jenis: 'masuk' | 'keluar'
          jumlah: number
          kategori: string
          keterangan: string
          tanggal: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          jenis: 'masuk' | 'keluar'
          jumlah: number
          kategori: string
          keterangan: string
          tanggal: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          jenis?: 'masuk' | 'keluar'
          jumlah?: number
          kategori?: string
          keterangan?: string
          tanggal?: string
          created_at?: string
          updated_at?: string
        }
      }
      anggota: {
        Row: {
          id: string
          user_id: string
          nama: string
          email: string
          telepon: string
          nickname: string
          status: 'aktif' | 'non-aktif'
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          nama: string
          email: string
          telepon: string
          nickname: string
          status: 'aktif' | 'non-aktif'
          role: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          nama?: string
          email?: string
          telepon?: string
          nickname?: string
          status?: 'aktif' | 'non-aktif'
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
