# Authentication Setup Guide

## Troubleshooting Sign Up / Sign In Issues

If you can't sign up or sign in, follow these steps to configure Supabase Auth correctly.

---

## Step 1: Configure Site URL in Supabase

Supabase needs to know your production domain for redirects and email confirmations.

### Instructions:

1. **Go to Supabase Authentication Settings:**
   - Visit: https://app.supabase.com/project/yoylonxmxsrzgkqcvotc/auth/url-configuration

2. **Set Site URL:**
   - Find the **"Site URL"** field
   - Enter your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
   - Click **"Save"**

3. **Add Redirect URLs (Whitelist):**
   Scroll down to **"Redirect URLs"** section and add these URLs:

   For **Production:**
   ```
   https://your-app.vercel.app/auth/confirm
   https://your-app.vercel.app/auth/callback
   https://your-app.vercel.app/**
   ```

   For **Local Development:**
   ```
   http://localhost:3000/auth/confirm
   http://localhost:3000/auth/callback
   http://localhost:3000/**
   ```

   **Replace `your-app.vercel.app` with your actual Vercel domain!**

4. Click **"Save"** at the bottom

---

## Step 2: Configure Email Authentication

### Check Email Provider Settings:

1. **Go to Email Templates:**
   - Visit: https://app.supabase.com/project/yoylonxmxsrzgkqcvotc/auth/templates

2. **Verify Email Confirmation is Enabled:**
   - Go to: https://app.supabase.com/project/yoylonxmxsrzgkqcvotc/auth/providers
   - Scroll to **"Email"**
   - Make sure **"Enable Email provider"** is toggled ON
   - Check **"Confirm email"** setting:
     - **Option A (Easier for testing):** Turn OFF "Confirm email" temporarily
     - **Option B (Production-ready):** Keep it ON and configure email properly

### Option A: Disable Email Confirmation (Quick Testing)

**Best for:** Quick testing, development

1. Go to: https://app.supabase.com/project/yoylonxmxsrzgkqcvotc/auth/providers
2. Scroll to **Email** section
3. Toggle **"Confirm email"** to **OFF**
4. Click **"Save"**

**Pros:** Users can sign up and log in immediately
**Cons:** No email verification (not secure for production)

### Option B: Configure Email Properly (Production)

**Best for:** Production, secure applications

1. **Go to Email Settings:**
   - Visit: https://app.supabase.com/project/yoylonxmxsrzgkqcvotc/settings/auth

2. **Choose Email Provider:**

   **Default (Supabase's Email Service):**
   - Free tier: 3 emails/hour, 30/day
   - Fine for testing, but limited
   - Already configured, just needs URL settings

   **Custom SMTP (Recommended for Production):**
   - Use SendGrid, Mailgun, AWS SES, etc.
   - Configure in **Auth → Email → SMTP Settings**
   - Much higher limits

3. **Configure Email Templates:**
   - Go to: https://app.supabase.com/project/yoylonxmxsrzgkqcvotc/auth/templates
   - Click on **"Confirm signup"** template
   - Verify the redirect URL includes: `{{ .SiteURL }}/auth/confirm`
   - Should look like: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`

---

## Step 3: Verify Environment Variables in Vercel

Make sure Vercel has the correct environment variables:

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Select your project

2. **Go to Settings → Environment Variables**

3. **Verify these are set:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://yoylonxmxsrzgkqcvotc.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlveWxvbnhteHNyemdrcWN2b3RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNzM2MTQsImV4cCI6MjA3NjY0OTYxNH0.OZIRkvSMdu_wqU4DJjyxneaJSskRMvcx-CaYsx14CWc
   ```

4. **If you make changes:**
   - Click **"Save"**
   - Go to **Deployments** tab
   - Click **"Redeploy"** on the latest deployment

---

## Step 4: Test the Flow

### Test Sign Up:

1. **Go to your deployed app:** `https://your-app.vercel.app`

2. **Click "Sign Up"** (or go to `/auth/sign-up`)

3. **Enter email and password** (password must be 6+ characters)

4. **Click "Sign Up"**

5. **What should happen:**

   **If email confirmation is OFF:**
   - ✅ Immediately redirected to dashboard
   - ✅ Can access `/protected` page

   **If email confirmation is ON:**
   - ✅ Redirected to "Check your email" page
   - ✅ Receive confirmation email
   - ✅ Click link in email → confirms account
   - ✅ Can now log in

### Test Sign In:

1. **Go to `/auth/login`**

2. **Enter credentials**

3. **Click "Sign In"**

4. **Should redirect to `/protected`** and see the metrics dashboard

---

## Common Issues & Solutions

### Issue 1: "Invalid login credentials"

**Cause:** Wrong email/password or account not confirmed

**Solutions:**
- Double-check email and password
- If email confirmation is ON, check your inbox for confirmation email
- Try signing up again with a new email
- Turn OFF email confirmation in Supabase (see Step 2, Option A)

### Issue 2: "Email not confirmed"

**Cause:** Email confirmation is ON but user hasn't clicked the link

**Solutions:**
- Check spam folder for confirmation email
- Resend confirmation email (use "Forgot password" flow)
- Temporarily disable email confirmation (see Step 2, Option A)

### Issue 3: "Invalid redirect URL"

**Cause:** Vercel deployment URL not whitelisted in Supabase

**Solutions:**
- Add your Vercel URL to Supabase redirect URLs (Step 1)
- Make sure you include `/auth/confirm` path
- Use wildcard: `https://your-app.vercel.app/**`

### Issue 4: No confirmation email received

**Cause:** Supabase email rate limits or SMTP not configured

**Solutions:**
- Check Supabase free tier limits (3/hour, 30/day)
- Wait an hour and try again
- Configure custom SMTP provider
- Disable email confirmation for testing

### Issue 5: "Failed to fetch" or network errors

**Cause:** Incorrect Supabase URL or API key

**Solutions:**
- Verify environment variables in Vercel (Step 3)
- Check `.env.local` for local development
- Ensure no typos in the URLs/keys
- Redeploy after fixing env vars

---

## Quick Start Configuration (Recommended)

**For fastest setup and testing:**

1. **Disable email confirmation:**
   - Supabase → Auth → Providers → Email → Toggle OFF "Confirm email"

2. **Set Site URL:**
   - Supabase → Auth → URL Configuration → Set to your Vercel URL

3. **Add Redirect URLs:**
   - Add: `https://your-app.vercel.app/**`
   - Add: `http://localhost:3000/**`

4. **Test signup:**
   - Should work immediately without email verification

5. **Later, enable email confirmation:**
   - Configure SMTP provider
   - Enable "Confirm email"
   - Test the full flow

---

## Checking Your Configuration

### Verify in Supabase Dashboard:

1. **Auth Providers:** https://app.supabase.com/project/yoylonxmxsrzgkqcvotc/auth/providers
   - ✅ Email provider enabled
   - ⚙️ Confirm email: ON or OFF (your choice)

2. **URL Configuration:** https://app.supabase.com/project/yoylonxmxsrzgkqcvotc/auth/url-configuration
   - ✅ Site URL set to Vercel deployment URL
   - ✅ Redirect URLs include your deployment URL

3. **Users List:** https://app.supabase.com/project/yoylonxmxsrzgkqcvotc/auth/users
   - Check if users are being created
   - Check their confirmation status

---

## Need More Help?

If you're still having issues, check:

1. **Browser Console (F12 → Console tab):**
   - Look for error messages
   - Check if there are network failures

2. **Network Tab (F12 → Network tab):**
   - Look for failed requests to Supabase
   - Check the response messages

3. **Supabase Logs:**
   - Visit: https://app.supabase.com/project/yoylonxmxsrzgkqcvotc/logs/explorer
   - Look for authentication errors

Share the error messages and I can help debug further!
