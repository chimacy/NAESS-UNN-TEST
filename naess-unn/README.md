# NAESS UNN Website + CMS

Next.js + Supabase. Deploy on Vercel, no terminal needed.

## One-time Supabase setup
1. SQL editor: run `supabase/001_schema.sql` (already done), then `supabase/002_patch.sql`.
2. Make yourself Super Admin (replace the email):
   insert into public.profiles (id, full_name, role) select id, email, 'super_admin' from auth.users where email = 'YOUR_EMAIL_HERE' on conflict (id) do update set role = 'super_admin', active = true;

## Deploy on Vercel
1. Create a free GitHub account, make a new repository, and upload the contents of this folder (GitHub: Add file > Upload files).
2. On vercel.com choose Add New > Project > import that repository.
3. Before clicking Deploy, open "Environment Variables" and add:
   - NEXT_PUBLIC_SUPABASE_URL  (Supabase > Project Settings > API > Project URL)
   - NEXT_PUBLIC_SUPABASE_ANON_KEY  (same page, anon public key)
   - SUPABASE_SERVICE_ROLE_KEY  (same page, service_role key. Secret: only paste it into Vercel)
   - NEXT_PUBLIC_SITE_URL  (your Vercel address, e.g. https://naess-unn.vercel.app; add it after the first deploy, then Redeploy)
4. Click Deploy. Open your-site/login, sign in, then go to Site Settings and upload the logo.
5. In Supabase > Authentication > URL Configuration, set Site URL to your Vercel address.
