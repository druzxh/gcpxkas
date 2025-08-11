-- Migration: Add bulan_pembayaran column to kas table
-- Run this in your Supabase SQL Editor

-- Add bulan_pembayaran column to kas table
ALTER TABLE public.kas 
ADD COLUMN IF NOT EXISTS bulan_pembayaran TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN public.kas.bulan_pembayaran IS 'Bulan pembayaran untuk iuran (format: YYYY-MM, contoh: 2025-08). Null jika bukan pembayaran iuran bulanan.';

-- Create index for better query performance on bulan_pembayaran
CREATE INDEX IF NOT EXISTS idx_kas_bulan_pembayaran ON public.kas(bulan_pembayaran) WHERE bulan_pembayaran IS NOT NULL;

-- Create composite index for checking pembayaran per anggota per bulan
CREATE INDEX IF NOT EXISTS idx_kas_anggota_bulan_pembayaran ON public.kas(anggota_id, bulan_pembayaran) WHERE bulan_pembayaran IS NOT NULL;

-- Optional: Add constraint to ensure bulan_pembayaran format is correct
ALTER TABLE public.kas 
ADD CONSTRAINT check_bulan_pembayaran_format 
CHECK (bulan_pembayaran IS NULL OR bulan_pembayaran ~ '^\d{4}-\d{2}$');
