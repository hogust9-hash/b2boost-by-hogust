
-- Add logo_url column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS logo_url text;

-- Create logos storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to logos bucket
CREATE POLICY "Users can upload logos" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'logos');

-- Allow public read access
CREATE POLICY "Public read logos" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'logos');

-- Allow users to update their own logos
CREATE POLICY "Users can update own logos" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'logos');

-- Allow users to delete their own logos
CREATE POLICY "Users can delete own logos" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'logos');
