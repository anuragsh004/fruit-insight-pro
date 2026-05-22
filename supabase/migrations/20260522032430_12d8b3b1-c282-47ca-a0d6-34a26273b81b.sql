
CREATE POLICY "Anyone can upload fruit images"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'fruit-images');

CREATE POLICY "Anyone can view fruit images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'fruit-images');
