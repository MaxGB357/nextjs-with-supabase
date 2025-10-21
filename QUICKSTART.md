# Quick Start Guide - User Metrics Dashboard

Get your metrics dashboard up and running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- Your Supabase project URL and anon key (already configured)

## Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

1. Go to your Supabase project: https://app.supabase.com/project/yoylonxmxsrzgkqcvotc
2. Click on **SQL Editor** in the sidebar
3. Copy the entire contents of `supabase/migrations/20250101000000_create_user_metrics.sql`
4. Paste into SQL Editor and click **Run**

You should see: "Success. No rows returned"

### 3. Start the Application

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### 4. Create Your Account

1. Click **Sign Up** or navigate to `/auth/sign-up`
2. Enter your email and password
3. Check your email for the confirmation link
4. Click the confirmation link to verify your account

### 5. Log In

1. Navigate to `/auth/login` or click **Log In**
2. Enter your credentials
3. You'll be redirected to the metrics dashboard

### 6. Import Sample Data

In a new terminal (keep the dev server running):

```bash
npm run seed-sample your-email@example.com
```

Replace `your-email@example.com` with the email you used to sign up.

### 7. View Your Dashboard

Refresh the page at http://localhost:3000/protected

You should now see:
- Summary statistics (total count, average value, categories)
- Category breakdown with progress bars
- Complete metrics table

## What's Next?

- Read the full documentation: `METRICS_DASHBOARD_README.md`
- Import your own data: `npm run import-metrics path/to/your/metrics.csv`
- Customize the dashboard components in `components/metrics/`
- Add new features following the architecture guide

## Troubleshooting

**Can't import data?**
- Make sure you're logged in to the web app first
- Ensure the database migration ran successfully

**Dashboard is empty?**
- Run the seed script: `npm run seed-sample your-email@example.com`
- Check that you're logged in with the correct account

**Build errors?**
- Clear cache: `rm -rf .next`
- Reinstall: `rm -rf node_modules && npm install`

Need more help? See `METRICS_DASHBOARD_README.md` for detailed troubleshooting.
