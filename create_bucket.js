import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Creating storage bucket...')
    // Insert into storage.buckets
    await prisma.$executeRawUnsafe(`
      INSERT INTO storage.buckets (id, name, public)
      VALUES ('product-images', 'product-images', true)
      ON CONFLICT (id) DO NOTHING;
    `)
    
    console.log('Creating RLS policy for anonymous uploads...')
    // Create policy to allow anonymous uploads (for the admin panel without Supabase Auth)
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access'
        ) THEN
            CREATE POLICY "Public Access" ON storage.objects FOR ALL USING (bucket_id = 'product-images');
        END IF;
      END
      $$;
    `)
    
    console.log('Success! Bucket "product-images" is ready.')
  } catch (err) {
    console.error('Failed to create bucket:', err)
  } finally {
    await prisma.$disconnect()
  }
}

main()
