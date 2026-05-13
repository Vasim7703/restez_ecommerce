-- Create 'products' bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do update set public = true;

-- Policy to allow public viewing of product images
create policy "Public Access to Products"
on storage.objects for select
using ( bucket_id = 'products' );

-- Policy to allow authenticated users (or anyone if you prefer) to upload
create policy "Allow Uploads to Products"
on storage.objects for insert
with check ( bucket_id = 'products' );

-- Create 'cms' bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('cms', 'cms', true)
on conflict (id) do update set public = true;

-- Policy to allow public viewing of cms images
create policy "Public Access to CMS"
on storage.objects for select
using ( bucket_id = 'cms' );

-- Policy to allow authenticated users to upload to cms
create policy "Allow Uploads to CMS"
on storage.objects for insert
with check ( bucket_id = 'cms' );
