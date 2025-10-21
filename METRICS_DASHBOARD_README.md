# User Metrics Dashboard - Production-Ready MVP

A secure, type-safe user metrics dashboard built with Next.js 14+ (App Router) and Supabase. Features server-side authentication, Row Level Security, and real-time data filtering.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Setup Instructions](#setup-instructions)
- [Database Schema](#database-schema)
- [Usage Guide](#usage-guide)
- [Security](#security)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

---

## Overview

This application provides a production-ready dashboard where authenticated users can view their personal metrics in a clean, responsive interface. Built on modern full-stack patterns with:

- **Next.js 14+** with App Router for server-side rendering
- **Supabase** for authentication and PostgreSQL database
- **TypeScript** for type safety throughout the stack
- **Row Level Security (RLS)** for automatic user data isolation
- **Responsive UI** with Tailwind CSS and Radix UI components

## Features

### Core Functionality
- User authentication (email/password)
- Email verification flow
- Protected routes with automatic session refresh
- Real-time metrics dashboard
- Summary statistics (total count, average value, category breakdown)
- Responsive table view with filtering by category
- Data import utilities for bulk loading

### Security
- Row Level Security (RLS) enforced at database level
- Automatic user data isolation (users can only see their own metrics)
- Server-side authentication checks
- HTTPS-only communication with Supabase

### Type Safety
- Full TypeScript coverage
- Database types generated from schema
- Type-safe Supabase client
- Compile-time error checking

---

## Architecture

### Tech Stack

```
┌─────────────────────────────────────────┐
│         Next.js 14 App Router           │
│  (Server Components + Server Actions)   │
└─────────────────────────────────────────┘
                    │
                    ↓
┌─────────────────────────────────────────┐
│         Supabase Client (SSR)           │
│    (Type-safe with Database types)      │
└─────────────────────────────────────────┘
                    │
                    ↓
┌─────────────────────────────────────────┐
│           Supabase Platform             │
│  • Auth (email/password + verification) │
│  • PostgreSQL with RLS                  │
│  • Real-time subscriptions              │
└─────────────────────────────────────────┘
```

### Project Structure

```
nextjs-with-supabase/
├── app/
│   ├── auth/                    # Authentication pages
│   │   ├── login/
│   │   ├── sign-up/
│   │   └── confirm/
│   └── protected/               # Protected dashboard
│       └── page.tsx             # Main metrics dashboard
├── components/
│   ├── metrics/                 # Metrics display components
│   │   ├── metrics-summary.tsx  # Summary statistics cards
│   │   ├── metrics-table.tsx    # Data table component
│   │   └── category-breakdown.tsx
│   └── ui/                      # Reusable UI components
├── lib/
│   ├── services/
│   │   └── metrics.service.ts   # Business logic for metrics
│   ├── supabase/
│   │   ├── client.ts            # Browser client
│   │   ├── server.ts            # Server client
│   │   └── middleware.ts        # Session management
│   └── types/
│       └── database.types.ts    # TypeScript types
├── supabase/
│   └── migrations/
│       └── 20250101000000_create_user_metrics.sql
└── scripts/
    ├── import-metrics.ts        # CSV import utility
    ├── seed-sample-data.ts      # Sample data seeder
    └── sample-metrics.csv       # Example CSV format
```

---

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- Git (for deployment)

### Step 1: Install Dependencies

```bash
npm install
```

This installs all required packages including:
- Next.js 14+
- Supabase SSR and client libraries
- TypeScript and type definitions
- UI component libraries (Radix UI, Tailwind CSS)
- tsx for running TypeScript scripts

### Step 2: Environment Configuration

The environment variables are already configured in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://yoylonxmxsrzgkqcvotc.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Set Up Database

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/20250101000000_create_user_metrics.sql`
4. Paste and execute the SQL

This will:
- Create the `user_metrics` table
- Enable Row Level Security
- Create RLS policies for secure data access
- Set up indexes for performance
- Create triggers for automatic timestamp updates

### Step 4: Verify Database Setup

After running the migration, verify:

1. **Table exists**: Check Tables tab for `user_metrics`
2. **RLS enabled**: Table should show "RLS Enabled" badge
3. **Policies active**: Should see 4 policies (SELECT, INSERT, UPDATE, DELETE)

---

## Database Schema

### user_metrics Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `user_id` | UUID | Foreign key to auth.users (RLS enforces ownership) |
| `metric_name` | TEXT | Name/title of the metric |
| `metric_value` | INTEGER | Numeric value between 1-5 |
| `category` | TEXT | Category grouping (e.g., Performance, Quality) |
| `description` | TEXT | Optional detailed description |
| `created_at` | TIMESTAMP | Auto-set on creation |
| `updated_at` | TIMESTAMP | Auto-updated on modification |

### Constraints

- `metric_value` must be between 1 and 5 (CHECK constraint)
- `user_id` references auth.users with CASCADE delete
- Indexes on `user_id`, `category`, and `created_at` for performance

### Row Level Security Policies

All policies enforce `auth.uid() = user_id`:

1. **SELECT**: Users can only view their own metrics
2. **INSERT**: Users can only insert metrics with their own user_id
3. **UPDATE**: Users can only update their own metrics
4. **DELETE**: Users can only delete their own metrics

---

## Usage Guide

### Running the Application

```bash
# Development mode with Turbopack
npm run dev

# Production build
npm run build
npm start

# Linting
npm run lint
```

The app will be available at `http://localhost:3000`

### User Flow

1. **Sign Up**
   - Navigate to `/auth/sign-up`
   - Enter email and password
   - Receive confirmation email
   - Click confirmation link

2. **Login**
   - Navigate to `/auth/login`
   - Enter credentials
   - Redirected to dashboard

3. **View Dashboard**
   - Access `/protected` (or click Dashboard link)
   - See summary statistics
   - View category breakdown
   - Browse all metrics in table

### Importing Data

#### Option 1: Import from CSV

```bash
npm run import-metrics scripts/sample-metrics.csv
```

CSV format:
```csv
metric_name,metric_value,category,description
API Response Time,4,Performance,Average response time
Code Coverage,5,Quality,Test coverage percentage
```

#### Option 2: Seed Sample Data

```bash
npm run seed-sample your-email@example.com
```

This imports 15 pre-defined sample metrics for quick testing.

#### Option 3: Custom CSV

Create your own CSV file following the format above, then:

```bash
npm run import-metrics path/to/your/metrics.csv
```

**Important**: You must be logged in before running import scripts. The scripts use your authentication token to ensure metrics are associated with your user account.

---

## Security

### Row Level Security (RLS)

The application's security is enforced at the database level using Supabase RLS:

```sql
-- Example: Users can only SELECT their own metrics
CREATE POLICY "Users can view their own metrics"
  ON public.user_metrics
  FOR SELECT
  USING (auth.uid() = user_id);
```

**What this means:**
- Even if someone gets direct database access, they can't see other users' data
- No application-level filtering needed - database handles it automatically
- Impossible to accidentally leak data across users

### Authentication Flow

1. User signs up → Supabase creates entry in `auth.users`
2. Email confirmation → Verifies ownership
3. Login → Supabase issues JWT token
4. Token stored in httpOnly cookie → Protected from XSS
5. Middleware refreshes token automatically → Seamless UX
6. Server components verify auth → SSR with security

### Best Practices Implemented

- Environment variables for sensitive keys
- HTTPS-only communication
- Server-side authentication checks
- Type-safe database queries
- Input validation (metric_value 1-5)
- Prepared statements (SQL injection protection)

---

## Development

### Type Generation

TypeScript types are manually defined in `lib/types/database.types.ts`. For automatic generation:

```bash
# Install Supabase CLI
npm install -g supabase

# Generate types
supabase gen types typescript --project-id yoylonxmxsrzgkqcvotc > lib/types/database.types.ts
```

### Adding New Features

1. **New metric fields**: Update migration SQL, then regenerate types
2. **New dashboard components**: Add to `components/metrics/`
3. **New calculations**: Add to `lib/services/metrics.service.ts`
4. **New pages**: Add to `app/` following Next.js App Router conventions

### Testing Data Isolation

1. Create two user accounts
2. Import different metrics for each
3. Login as User A → should only see User A's metrics
4. Login as User B → should only see User B's metrics
5. Try direct Supabase API calls → RLS blocks cross-user access

---

## Troubleshooting

### Common Issues

#### "Not authenticated" error when importing data

**Solution**: Make sure you're logged in to the web app first. The import scripts use your session token.

```bash
# 1. Start the app
npm run dev

# 2. Sign in at http://localhost:3000/auth/login

# 3. Then run import script
npm run seed-sample your-email@example.com
```

#### Empty dashboard after login

**Causes:**
1. No data imported yet → Use seed script
2. RLS policies not created → Re-run migration SQL
3. Wrong user logged in → Check email address

**Debug steps:**
```bash
# Check if table exists
# In Supabase SQL Editor:
SELECT COUNT(*) FROM user_metrics;

# Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'user_metrics';
```

#### TypeScript errors after schema changes

**Solution**: Regenerate types

```bash
# Manual update
# Edit lib/types/database.types.ts to match new schema

# Or use Supabase CLI
supabase gen types typescript --project-id yoylonxmxsrzgkqcvotc > lib/types/database.types.ts
```

#### Build failures

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Getting Help

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Project Issues**: Check console logs and Network tab in browser DevTools

---

## Success Criteria Checklist

- [x] Users can sign up with email/password
- [x] Email verification flow works correctly
- [x] Users can log in and access dashboard
- [x] Dashboard displays only authenticated user's metrics (enforced by RLS)
- [x] Summary statistics show: total count, average value, category breakdown
- [x] TypeScript types generated from Supabase schema
- [x] Row Level Security policies prevent cross-user data access
- [x] Data import script successfully populates database
- [x] Environment setup documented with step-by-step instructions
- [x] Middleware refreshes auth sessions automatically

---

## Next Steps

### Potential Enhancements

1. **Real-time updates**: Use Supabase subscriptions for live dashboard updates
2. **Data visualization**: Add charts with Recharts or Chart.js
3. **Filtering/Search**: Add UI controls for filtering by category or date range
4. **Export functionality**: Allow users to export their metrics to CSV
5. **Metric editing**: Add forms to create/update/delete metrics via UI
6. **Pagination**: Implement cursor-based pagination for large datasets
7. **Admin dashboard**: Create separate admin view with service role access

### Production Considerations

- Set up CI/CD pipeline (GitHub Actions, Vercel, etc.)
- Configure custom domain and SSL
- Enable Supabase database backups
- Set up error monitoring (Sentry, LogRocket)
- Implement rate limiting
- Add comprehensive logging
- Set up staging environment

---

## License

This project is part of a demonstration/MVP. Adapt as needed for your use case.

## Credits

Built with:
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
