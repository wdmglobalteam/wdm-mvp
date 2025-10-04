// --- filename: lib/types/supabase.ts ---

// Recursive JSON type for Supabase columns with "json" type
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];
