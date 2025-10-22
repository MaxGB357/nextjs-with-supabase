# Local Development Guide

Complete guide for testing and developing the metrics dashboard on your local machine.

---

## Quick Start (5 Minutes)

### Prerequisites
- Node.js 18+ installed ([Download here](https://nodejs.org/))
- Git installed
- A terminal/command prompt
- A web browser

---

## Step 1: Clone the Repository

Open your terminal and run:

```bash
# Clone your repository
git clone https://github.com/MaxGB357/nextjs-with-supabase.git

# Navigate into the project
cd nextjs-with-supabase

# Checkout the main branch
git checkout main

# Pull latest changes
git pull origin main
```

**Verify you're in the right place:**
```bash
# Should show package.json, app/, components/, etc.
ls
```

---

## Step 2: Install Dependencies

```bash
npm install
```

This will:
- Download all required packages
- Take 1-3 minutes depending on your internet speed
- Create a `node_modules` folder

**Expected output:** "added XXX packages" with no major errors

---

## Step 3: Configure Environment Variables

The `.env.local` file should already exist with your Supabase credentials. Let's verify:

```bash
# Check if .env.local exists
cat .env.local
```

**Should show:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://yoylonxmxsrzgkqcvotc.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**If the file is missing**, create it:

```bash
# Create .env.local file
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://yoylonxmxsrzgkqcvotc.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlveWxvbnhteHNyemdrcWN2b3RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNzM2MTQsImV4cCI6MjA3NjY0OTYxNH0.OZIRkvSMdu_wqU4DJjyxneaJSskRMvcx-CaYsx14CWc
EOF
```

---

## Step 4: Configure Supabase for Local Development

Add localhost to your Supabase allowed URLs:

1. **Go to Supabase URL Configuration:**
   ```
   https://app.supabase.com/project/yoylonxmxsrzgkqcvotc/auth/url-configuration
   ```

2. **Add localhost to Redirect URLs:**
   Click "Add URL" and add these:
   ```
   http://localhost:3000/**
   http://localhost:3000/auth/confirm
   http://localhost:3000/auth/callback
   ```

3. **Click "Save"**

---

## Step 5: Start the Development Server

```bash
npm run dev
```

**Expected output:**
```
> dev
> next dev --turbopack

  ▲ Next.js 15.x.x
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Starting...
✓ Ready in 2.5s
```

**The server is now running!** 🎉

---

## Step 6: Open in Your Browser

1. **Open your web browser**

2. **Go to:** http://localhost:3000

3. **You should see:** The landing page of your app

---

## Testing the Application Locally

### Test Sign Up Flow

1. **Navigate to Sign Up:**
   - Click "Sign Up" button
   - OR go directly to: http://localhost:3000/auth/sign-up

2. **Create an account:**
   - Email: `test@example.com` (or any email)
   - Password: `password123` (or any 6+ chars)
   - Click "Sign Up"

3. **Expected result:**
   - If email confirmation is OFF: Redirected to dashboard immediately
   - If email confirmation is ON: See "Check your email" message

### Test Dashboard

1. **After login, go to:** http://localhost:3000/protected

2. **You should see:**
   - Metrics Dashboard header
   - Summary statistics (all zeros if no data)
   - Empty metrics table
   - "You don't have any metrics yet" message

### Import Sample Data

Open a **NEW terminal** (keep the dev server running in the first one):

```bash
# Navigate to your project
cd nextjs-with-supabase

# Import sample data
npm run seed-sample test@example.com
```

**Replace `test@example.com` with the email you used to sign up!**

**Expected output:**
```
=== Seeding Sample Metrics ===

Finding user: test@example.com
Seeding 15 metrics for test@example.com
Successfully seeded 15 metrics

Sample data seeded! Visit /protected to view your metrics dashboard.
```

### View Your Metrics

1. **Refresh the dashboard:** http://localhost:3000/protected

2. **You should now see:**
   - ✅ Total Count: 15
   - ✅ Average Value: ~4.00
   - ✅ Categories: 7 unique categories
   - ✅ Full table with all 15 metrics
   - ✅ Category breakdown with progress bars

---

## Development Workflow

### Making Changes While Developing

Next.js has **Hot Module Replacement (HMR)** - changes automatically reload!

**Example: Edit a component**

1. **Open a file** (e.g., `components/metrics/metrics-table.tsx`)

2. **Make a change:**
   ```tsx
   <CardTitle>Your Metrics</CardTitle>
   // Change to:
   <CardTitle>My Personal Metrics 🎯</CardTitle>
   ```

3. **Save the file**

4. **Browser automatically updates!** No need to refresh

### Testing Different Scenarios

**Create multiple users:**
```bash
# Sign up with different emails
# Each user will have their own isolated data (thanks to RLS!)
```

**Test RLS (Row Level Security):**
1. Sign up as user A (e.g., alice@test.com)
2. Import data for Alice
3. Sign out
4. Sign up as user B (e.g., bob@test.com)
5. Bob should NOT see Alice's data (RLS working!)

**Test authentication flows:**
- Sign up → Sign out → Sign in
- Forgot password flow
- Email verification (if enabled)

---

## Useful Development Commands

```bash
# Start development server
npm run dev

# Run TypeScript type checking
npx tsc --noEmit

# Run ESLint
npm run lint

# Build for production (test if it compiles)
npm run build

# Start production server (after build)
npm start

# Import metrics from CSV
npm run import-metrics path/to/your/file.csv

# Seed sample data
npm run seed-sample your-email@example.com
```

---

## Debugging Tools

### Browser Developer Tools (F12)

**Console Tab:**
- Shows JavaScript errors
- Console.log output
- Network errors

**Network Tab:**
- See all API requests to Supabase
- Check request/response data
- Find failed requests (red color)

**Application Tab:**
- View cookies (auth tokens)
- Check localStorage
- Inspect session data

### VS Code (If using)

**Install extensions:**
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript error highlighting

---

## Common Local Development Issues

### Issue 1: Port 3000 Already in Use

**Error:** `Port 3000 is already in use`

**Solutions:**
```bash
# Option 1: Kill the process on port 3000
# On macOS/Linux:
lsof -ti:3000 | xargs kill -9

# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Option 2: Use a different port
PORT=3001 npm run dev
```

### Issue 2: Module Not Found Errors

**Error:** `Cannot find module 'xyz'`

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue 3: Environment Variables Not Loading

**Error:** Cannot connect to Supabase

**Solution:**
```bash
# Verify .env.local exists
cat .env.local

# Restart the dev server (Ctrl+C then npm run dev)
```

### Issue 4: TypeScript Errors

**Error:** Type errors in terminal

**Solution:**
```bash
# Check for TypeScript errors
npx tsc --noEmit

# Usually safe to ignore in development if app works
# Fix before committing to git
```

### Issue 5: Hot Reload Not Working

**Problem:** Changes don't appear in browser

**Solutions:**
1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Restart dev server
3. Clear browser cache
4. Check terminal for build errors

---

## Workflow: Using Claude Code + Local Testing

### Recommended Setup

**Two Windows:**
1. **Browser:** http://localhost:3000 (your running app)
2. **Claude Code:** GitHub Codespaces or local terminal

**Development Flow:**
1. Make changes using Claude Code
2. Claude Code commits and pushes to GitHub
3. Pull changes locally: `git pull origin main`
4. Dev server auto-reloads with changes
5. Test in browser
6. Repeat!

**Alternative: Direct Local Editing**
1. Clone repo locally
2. Open in VS Code or your editor
3. Run `npm run dev`
4. Make changes directly
5. See instant feedback in browser
6. Commit and push when satisfied

---

## Project Structure (For Reference)

```
nextjs-with-supabase/
├── app/                          # Next.js App Router pages
│   ├── auth/                     # Authentication pages
│   │   ├── login/page.tsx        # Login page
│   │   ├── sign-up/page.tsx      # Sign up page
│   │   └── confirm/route.ts      # Email confirmation handler
│   ├── protected/                # Protected routes
│   │   └── page.tsx              # Metrics dashboard (main page!)
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
│
├── components/                   # React components
│   ├── metrics/                  # Metrics-specific components
│   │   ├── metrics-summary.tsx   # Summary statistics cards
│   │   ├── metrics-table.tsx     # Data table
│   │   └── category-breakdown.tsx # Category visualization
│   └── ui/                       # Reusable UI components
│
├── lib/                          # Utility libraries
│   ├── services/
│   │   └── metrics.service.ts    # Business logic for metrics
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   ├── server.ts             # Server Supabase client
│   │   └── middleware.ts         # Auth middleware
│   └── types/
│       └── database.types.ts     # TypeScript types
│
├── scripts/                      # Utility scripts
│   ├── import-metrics.ts         # Import from CSV
│   ├── seed-sample-data.ts       # Seed sample data
│   └── sample-metrics.csv        # Example CSV
│
├── supabase/
│   └── migrations/
│       └── 20250101000000_create_user_metrics.sql
│
├── .env.local                    # Environment variables (gitignored)
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript config
└── next.config.ts                # Next.js config
```

---

## Tips for Productive Local Development

### 1. Use Multiple Terminal Windows

**Terminal 1:** Dev server
```bash
npm run dev
```

**Terminal 2:** Git operations, scripts
```bash
git status
npm run seed-sample test@example.com
```

### 2. Keep Dev Server Running

Don't restart it unless:
- Installing new npm packages
- Changing .env.local
- Something is broken

### 3. Check Terminal Output

The dev server shows:
- Compilation errors
- Page routes being accessed
- API calls
- Build warnings

### 4. Use Git Branches for Experiments

```bash
# Create a branch for testing
git checkout -b my-test-branch

# Make experimental changes
# Test them locally

# If good, merge to main
git checkout main
git merge my-test-branch

# If bad, just delete the branch
git branch -D my-test-branch
```

### 5. Commit Often

```bash
# After each working feature
git add .
git commit -m "Add feature X"
git push origin main
```

---

## Next Steps

Once you're comfortable with local development:

1. **Customize the dashboard:**
   - Edit colors in `tailwind.config.ts`
   - Modify component layouts
   - Add new features

2. **Add new metrics:**
   - Create more sample data
   - Import from real CSV files
   - Add forms for manual entry

3. **Experiment with Supabase:**
   - Try real-time subscriptions
   - Add more database tables
   - Create custom SQL functions

4. **Deploy changes:**
   - Push to GitHub
   - Vercel auto-deploys
   - Test on production URL

---

## Getting Help

**If you get stuck:**
1. Check terminal for error messages
2. Check browser console (F12)
3. Read the error carefully
4. Search for the error online
5. Ask Claude Code for help!

**Useful resources:**
- Next.js Docs: https://nextjs.org/docs
- Supabase Docs: https://supabase.com/docs
- React Docs: https://react.dev/

---

Happy coding! 🚀
