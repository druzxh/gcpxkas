-- Database Setup for Squad GCP Management System
-- Run these SQL commands in your Supabase SQL Editor

-- Enable Row Level Security (RLS) if not already enabled
-- This ensures users can only access their own data

-- 1. Create anggota table first (since kas will reference it)
CREATE TABLE IF NOT EXISTS public.anggota (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nama TEXT NOT NULL,
    email TEXT NOT NULL,
    nickname TEXT NOT NULL,
    telepon TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('aktif', 'non-aktif')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create kas table with anggota relation
CREATE TABLE IF NOT EXISTS public.kas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    anggota_id UUID REFERENCES public.anggota(id) ON DELETE SET NULL,
    keterangan TEXT NOT NULL,
    jumlah DECIMAL(15,2) NOT NULL,
    jenis TEXT NOT NULL CHECK (jenis IN ('masuk', 'keluar')),
    kategori TEXT NOT NULL,
    tanggal DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security
ALTER TABLE public.kas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anggota ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for kas table
-- Users can only access their own kas records
CREATE POLICY "Users can view their own kas records" ON public.kas
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own kas records" ON public.kas
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own kas records" ON public.kas
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own kas records" ON public.kas
    FOR DELETE USING (auth.uid() = user_id);

-- 5. Create RLS policies for anggota table
-- Users can only access their own anggota records
CREATE POLICY "Users can view their own anggota records" ON public.anggota
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own anggota records" ON public.anggota
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own anggota records" ON public.anggota
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own anggota records" ON public.anggota
    FOR DELETE USING (auth.uid() = user_id);

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_kas_user_id ON public.kas(user_id);
CREATE INDEX IF NOT EXISTS idx_kas_anggota_id ON public.kas(anggota_id);
CREATE INDEX IF NOT EXISTS idx_kas_tanggal ON public.kas(tanggal);
CREATE INDEX IF NOT EXISTS idx_kas_jenis ON public.kas(jenis);
CREATE INDEX IF NOT EXISTS idx_anggota_user_id ON public.anggota(user_id);
CREATE INDEX IF NOT EXISTS idx_anggota_status ON public.anggota(status);

-- 7. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Create triggers to automatically update updated_at
CREATE TRIGGER update_kas_updated_at BEFORE UPDATE ON public.kas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anggota_updated_at BEFORE UPDATE ON public.anggota
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Optional: Insert sample data (remove this section if you don't want sample data)
-- Note: You'll need to replace 'your-user-id-here' with an actual user ID from auth.users

/*
-- Sample kas data
INSERT INTO public.kas (user_id, anggota_id, keterangan, jumlah, jenis, kategori, tanggal) VALUES
('your-user-id-here', 'your-anggota-id-here', 'Dana awal kas', 1000000, 'masuk', 'Modal', '2024-01-01'),
('your-user-id-here', NULL, 'Pembelian alat tulis', 50000, 'keluar', 'Operasional', '2024-01-02'),
('your-user-id-here', 'your-anggota-id-here', 'Iuran bulanan', 200000, 'masuk', 'Iuran', '2024-01-03');

-- Sample anggota data
INSERT INTO public.anggota (user_id, nama, email, nickname, telepon, role, status) VALUES
('your-user-id-here', 'John Doe', 'john@example.com', 'John', '081234567890', 'Developer', 'aktif'),
('your-user-id-here', 'Jane Smith', 'jane@example.com', 'Jane', '081234567891', 'Designer', 'aktif'),
('your-user-id-here', 'Bob Wilson', 'bob@example.com', 'Bob', '081234567892', 'Manager', 'non-aktif');
*/
