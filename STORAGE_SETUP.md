# Supabase Storage Setup for News Images

## Step 1: Create Storage Bucket

To enable image uploads for news, you need to create a storage bucket in Supabase:

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Enter bucket name: `news-images`
5. Make the bucket **Public** (so images can be viewed by everyone)
6. Click **Create bucket**

## Step 2: Create Storage Policies

After creating the bucket, set up RLS policies for the bucket:

1. Click on the `news-images` bucket
2. Go to the **Policies** tab
3. Click **New policy** → **For full customization**

### Policy 1: Allow Public Read
- Name: `Public Read`
- Operations: `SELECT`
- USING expression: `true`
- Click **Review** → **Save policy**

### Policy 2: Allow Authenticated Users to Upload
- Name: `Authenticated users can upload`
- Operations: `INSERT`
- USING expression: `auth.role() = 'authenticated'`
- WITH CHECK expression: `auth.role() = 'authenticated'`
- Click **Review** → **Save policy**

### Policy 3: Allow Users to Delete Their Own Uploads
- Name: `Users can delete own files`
- Operations: `DELETE`
- USING expression: `(storage.foldername(name))[1] = auth.uid()::text`
- Click **Review** → **Save policy**

## Step 3: Verify

Once the bucket and policies are created:

1. Go back to your React app
2. Try uploading an image in the Admin Dashboard → News & Events → Post News
3. Select an image file (max 5MB)
4. Click "Publish News"
5. The image should upload and the news should be created with the image

## Troubleshooting

**"Storage bucket not found" error:**
- Make sure the bucket name is exactly `news-images` (lowercase with hyphen)
- Check that the bucket is Public

**"Permission denied" error:**
- Check that you have the storage policies created
- Make sure the policies have the correct expressions

**Image not displaying:**
- Verify the bucket is Public
- Check that the public URL is correct in the database
