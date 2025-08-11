-- Migration: Add anggota relation to kas table
-- Run this migration in your Supabase SQL Editor if you have existing kas data

-- Add anggota_id column to kas table
ALTER TABLE public.kas ADD COLUMN IF NOT EXISTS anggota_id UUID REFERENCES public.anggota(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_kas_anggota_id ON public.kas(anggota_id);

-- Update any existing kas records (optional - you can set specific kas records to relate to specific anggota)
-- Example:
-- UPDATE public.kas SET anggota_id = 'some-anggota-id' WHERE id = 'some-kas-id';

-- Note: This migration is safe to run multiple times due to the "IF NOT EXISTS" clauses
