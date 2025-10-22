# Employee Performance Management System - Database Setup

This directory contains the complete database schema and import tools for the Employee Performance Management System.

## Overview

The system manages employee hierarchies and performance evaluations with the following features:
- Direct reports hierarchy (manager -> employees)
- Annual performance evaluations with multiple metrics
- Row Level Security (RLS) to ensure managers only see their team's data
- Integration with Supabase authentication

## Files

- **`schema.sql`** - Complete database schema with tables, RLS policies, and helper functions
- **`import_data.js`** - Node.js script to import data from CSV files
- **`example_queries.sql`** - Common SQL queries and usage examples
- **`jefaturacsv.csv`** - Employee hierarchy data
- **`datageneralcsv.csv`** - Performance evaluation data

## Database Schema

### Tables

1. **employees**
   - Core employee information and hierarchy
   - Links to Supabase auth UUIDs for managers
   - Fields: id, employee_code, rut, first_name, last_name, email, manager_id

2. **performance_evaluations**
   - Annual performance metrics and scores
   - One evaluation per employee per year
   - Fields: general_potential, competencies scores, performance ratings

3. **evaluation_comments**
   - Text commentary for evaluations
   - Flexible category-based system

## Setup Instructions

### 1. Create Supabase Project

If you haven't already:
1. Go to https://supabase.com
2. Create a new project
3. Wait for the project to finish setting up

### 2. Run Schema Migration

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy the contents of `schema.sql`
5. Paste and click **Run**
6. Verify success (you should see "Success. No rows returned")

### 3. Get Supabase Credentials

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy your **Project URL**
3. Copy your **service_role** key (not the anon key!)
   - ⚠️ **Warning**: Keep the service_role key secret - it bypasses RLS!

### 4. Install Dependencies

```bash
cd tablassql
npm install csv-parse @supabase/supabase-js uuid
```

### 5. Set Environment Variables

Create a `.env` file in the `tablassql` directory:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Alternative**: Export them in your terminal:

```bash
# Windows (PowerShell)
$env:SUPABASE_URL="https://your-project.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# Windows (CMD)
set SUPABASE_URL=https://your-project.supabase.co
set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Mac/Linux
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 6. Run Data Import

```bash
node import_data.js
```

The script will:
1. Read both CSV files
2. Generate UUIDs for all employees
3. Process hierarchy relationships
4. Import employees, evaluations, and comments
5. Verify the import was successful

### 7. Verify Import

1. Go to Supabase Dashboard → **Table Editor**
2. Check the `employees` table - you should see all employees
3. Check the `performance_evaluations` table - you should see all evaluations
4. Note the UUIDs for managers (employees who have direct reports)

### 8. Create Auth Users (Optional)

For managers to log in, you need to create auth accounts:

```sql
-- In Supabase SQL Editor, run for each manager:
-- Replace with actual UUID from employees table and real password

INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at
)
VALUES (
    'uuid-from-employees-table',
    'manager@example.com',
    crypt('temporary_password', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW()
);
```

**Better approach**: Use Supabase Auth UI to create accounts, then update the `employees` table to use those UUIDs.

## Testing the Setup

### Test RLS Policies

```sql
-- In Supabase SQL Editor, test RLS by impersonating a user:

-- Set the role to authenticated user
SET ROLE authenticated;
SET request.jwt.claims = '{"sub": "manager-uuid-here"}';

-- This should return only the manager and their direct reports
SELECT * FROM employees;

-- This should return only team evaluations
SELECT * FROM performance_evaluations;

-- Reset to full access
RESET ROLE;
```

### Test Helper Functions

```sql
-- Get direct reports for a manager
SELECT * FROM get_direct_reports('manager-uuid-here');

-- Get team performance for current year
SELECT * FROM get_team_performance('manager-uuid-here', 2024);
```

## Using in Your Next.js App

### 1. Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### 2. Create Supabase Client

```typescript
// utils/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### 3. Query Team Data

```typescript
// Get logged-in user's team data
const { data: { user } } = await supabase.auth.getUser();

// Get team members
const { data: team, error } = await supabase
  .from('employees')
  .select('*')
  .or(`id.eq.${user.id},manager_id.eq.${user.id}`);

// Get team performance
const { data: performance, error } = await supabase
  .rpc('get_team_performance', {
    manager_uuid: user.id,
    eval_year: 2024
  });
```

See `example_queries.sql` for more query examples.

## Configuration

### Updating Evaluation Year

Edit `import_data.js` and change the `evaluationYear`:

```javascript
const CONFIG = {
    evaluationYear: 2025, // Change this
    // ...
};
```

### Adding Comment Columns

If your CSV files have comment columns, update the `processPerformanceData` function in `import_data.js`:

```javascript
// Add this after creating the evaluation object
const commentCategories = [
    'general',
    'peer_client',
    'direct_manager',
    // ... add more categories
];

commentCategories.forEach(category => {
    const commentColumn = `${category}_comment`; // Adjust to your CSV column name
    if (record[commentColumn]) {
        comments.push({
            id: uuidv4(),
            evaluation_id: evaluationId,
            category: category,
            comment_text: cleanString(record[commentColumn])
        });
    }
});
```

## Troubleshooting

### Import Fails with "Manager not found"

This happens when an employee's `Identifier` (manager code) doesn't exist in the hierarchy CSV. The script will create the employee without a manager (top-level).

**Solution**: Ensure all manager IDs in `jefaturacsv.csv` have corresponding employee records.

### RLS Policy Blocks Query

If queries return empty results when they shouldn't:

1. Verify the user is authenticated
2. Check the user's UUID matches an employee ID in the database
3. Verify the employee has the correct `manager_id` set

**Debug**: Query as service_role to bypass RLS and inspect data.

### CSV Parsing Errors

If you get parsing errors:

1. Ensure CSV files are UTF-8 encoded
2. Check for special characters in data
3. Verify CSV headers match exactly

### Performance Issues

For large datasets (1000+ employees):

1. Increase batch size in `import_data.js`
2. Add database indexes on frequently queried columns
3. Consider using Supabase Edge Functions for complex queries

## Data Updates

To re-import data (e.g., annual update):

1. Update the `evaluationYear` in `import_data.js`
2. Run the import script again
3. The script uses `upsert` so existing employees will be updated
4. New evaluations will be added (one per year per employee)

## Security Notes

⚠️ **Important Security Considerations**:

- **Never** commit the `.env` file or expose service_role keys
- Only use service_role keys for server-side operations
- Use the anon key in client-side code (it respects RLS)
- RLS policies are enforced automatically - don't bypass them in production
- Validate user permissions in your application layer as well

## Support

For issues or questions:
1. Check `example_queries.sql` for query examples
2. Review Supabase documentation: https://supabase.com/docs
3. Test RLS policies in SQL Editor before implementing in code

## License

This schema and tooling is provided as-is for the Employee Performance Management System.
