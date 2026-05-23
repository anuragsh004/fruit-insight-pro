-- Remove permissive anon storage policies
DROP POLICY IF EXISTS "Anyone can upload fruit images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view fruit images" ON storage.objects;
DROP POLICY IF EXISTS "fruit-images read by path" ON storage.objects;

-- Add authenticated-only read scoped to own folder
CREATE POLICY "fruit-images read own"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'fruit-images'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Make bucket private
UPDATE storage.buckets SET public = false WHERE id = 'fruit-images';

-- Lock down the trigger helper (only invoked by the system trigger, not by API callers)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;