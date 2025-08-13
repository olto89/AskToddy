# Supabase Setup Guide for AskToddy

## Step 1: Create Supabase Account & Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project
4. Wait for the project to finish setting up

## Step 2: Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (a long string starting with `eyJ...`)

## Step 3: Update Your .env.local File

Replace the placeholder values in your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Create Storage Bucket (PRIVATE)

1. In Supabase dashboard, go to **Storage** (left sidebar)
2. Click **New bucket**
3. Name it: `project-uploads`
4. Keep **Public bucket** toggled OFF (for security)
5. Click **Create bucket**

## Step 5: Set Bucket Policies

For a private bucket with authenticated access via API keys:

1. Click on the `project-uploads` bucket
2. Go to **Policies** tab
3. Click **New Policy**
4. Choose **For full customization** 

### Create INSERT Policy (for uploads via API):
- **Policy name**: `Allow authenticated uploads`
- **Target roles**: Check `anon` and `authenticated`
- **WITH CHECK expression**: `true`
- Click **Review** then **Save policy**

### Create SELECT Policy (for viewing via API):
- Click **New Policy** again
- **Policy name**: `Allow authenticated viewing`
- **Target roles**: Check `anon` and `authenticated`  
- **USING expression**: `true`
- Click **Review** then **Save policy**

### Create DELETE Policy (optional - for file management):
- Click **New Policy** again
- **Policy name**: `Allow authenticated deletion`
- **Target roles**: Check `anon` and `authenticated`
- **USING expression**: `true`
- Click **Review** then **Save policy**

## Alternative: Quick Setup with SQL

Run these SQL commands in the SQL Editor (Settings → SQL Editor):

```sql
-- Create the private bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-uploads', 'project-uploads', false);

-- Allow authenticated uploads
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'project-uploads');

-- Allow authenticated viewing
CREATE POLICY "Allow authenticated viewing" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'project-uploads');

-- Allow authenticated deletion (optional)
CREATE POLICY "Allow authenticated deletion" ON storage.objects
FOR DELETE TO anon, authenticated
USING (bucket_id = 'project-uploads');
```

## Step 6: Test Your Setup

1. Restart your Next.js development server:
   ```bash
   npm run dev
   ```

2. Go to http://localhost:3000
3. Try uploading an image or video
4. Check the browser console for any errors

## Troubleshooting

### Common Issues:

1. **"Invalid API key"**: Double-check your `.env.local` values
2. **"Bucket not found"**: Make sure bucket name is exactly `project-uploads`
3. **"Permission denied"**: Policies might not be set correctly, review Step 5
4. **Files not showing after upload**: Make sure bucket is set to PUBLIC

### Verify in Supabase Dashboard:

- Go to Storage → project-uploads
- You should see uploaded files appearing here
- Click on a file to get its public URL

## Next Steps

Once everything is working:
1. Commit your changes (but NOT the .env.local file!)
2. Consider adding a database table to track project submissions
3. Implement the AI analysis feature

## Security Note

For production:
- Consider implementing user authentication
- Add file type validation on the backend
- Implement rate limiting for uploads
- Set up proper CORS policies