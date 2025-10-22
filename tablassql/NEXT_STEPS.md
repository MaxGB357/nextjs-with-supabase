# Next Steps - Integrating with Your Webapp

Congratulations! Your database is set up with all the data. Here's what to do next.

---

## Step 1: Verify Your Data

Run the queries in `verify_import.sql` in your Supabase SQL Editor:

1. **Query #1-8**: Check all your data is imported correctly
2. **Query #4**: **SAVE THE MANAGER UUIDs** - you'll need these!

---

## Step 2: Create Auth Accounts for Managers

Only employees who are managers need login accounts. You have two options:

### Option A: Supabase Dashboard (Recommended - Easier!)

1. Go to **Authentication** → **Users** → **Add User**
2. Enter manager's email and temporary password
3. Copy the generated UUID
4. Run this SQL to update your employees table:

```sql
-- Update the employee record to use the auth UUID
UPDATE employees
SET id = 'new-auth-uuid-here'
WHERE employee_code = 2;  -- Replace with manager's employee code

-- Update all references to the old UUID
UPDATE employees
SET manager_id = 'new-auth-uuid-here'
WHERE manager_id = 'old-uuid-here';

UPDATE performance_evaluations
SET employee_id = 'new-auth-uuid-here'
WHERE employee_id = 'old-uuid-here';

UPDATE evaluation_comments
SET evaluation_id = (
    SELECT id FROM performance_evaluations WHERE employee_id = 'new-auth-uuid-here'
)
WHERE evaluation_id IN (
    SELECT id FROM performance_evaluations WHERE employee_id = 'old-uuid-here'
);
```

### Option B: SQL Method (More Complex)

See the bottom of `verify_import.sql` for SQL INSERT statements to create auth accounts.

---

## Step 3: Test RLS Policies

In Supabase SQL Editor, test that Row Level Security is working:

```sql
-- Replace with actual manager UUID
SET ROLE authenticated;
SET request.jwt.claims = '{"sub": "manager-uuid-here"}';

-- This should only show the manager and their direct reports
SELECT * FROM employees;

-- Reset
RESET ROLE;
```

If you see only the manager and their direct reports, RLS is working! ✅

---

## Step 4: Query Data in Your Next.js App

### Install Supabase Client (if not already installed)

```bash
npm install @supabase/supabase-js
```

### Basic Setup

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### Example: Get Team Data

```typescript
// app/dashboard/page.tsx
import { supabase } from '@/lib/supabase';

export default async function DashboardPage() {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get team members (manager + direct reports)
  // RLS automatically filters to only show authorized data
  const { data: team, error } = await supabase
    .from('employees')
    .select(`
      employee_code,
      first_name,
      last_name,
      email,
      rut
    `)
    .or(`id.eq.${user.id},manager_id.eq.${user.id}`)
    .order('employee_code');

  // Get team performance data
  const { data: performance, error: perfError } = await supabase
    .from('performance_evaluations')
    .select(`
      *,
      employees!inner (
        employee_code,
        first_name,
        last_name,
        email
      )
    `)
    .eq('evaluation_year', 2024)
    .or(`employees.id.eq.${user.id},employees.manager_id.eq.${user.id}`);

  return (
    <div>
      <h1>My Team</h1>
      <TeamTable data={team} performance={performance} />
    </div>
  );
}
```

### Example: Using Helper Functions

```typescript
// The helper functions we created in schema.sql can be called via RPC
const { data: teamPerformance, error } = await supabase
  .rpc('get_team_performance', {
    manager_uuid: user.id,
    eval_year: 2024
  });
```

### Example: Get Direct Reports Only

```typescript
const { data: directReports, error } = await supabase
  .rpc('get_direct_reports', {
    manager_uuid: user.id
  });
```

---

## Step 5: Build Your Dashboard UI

Here's a suggested structure:

### Dashboard Layout
```
┌─────────────────────────────────────┐
│  My Team Dashboard                  │
│  Logged in as: Manager Name         │
├─────────────────────────────────────┤
│  Summary Cards:                     │
│  - Total Direct Reports: 3          │
│  - Avg Team Performance: 3.2        │
│  - High Performers: 2               │
├─────────────────────────────────────┤
│  Team Members Table:                │
│  ┌────┬──────┬──────┬──────┬─────┐ │
│  │Code│ Name │Potent│Compet│ ... │ │
│  ├────┼──────┼──────┼──────┼─────┤ │
│  │ 1  │ John │ 3.0  │ 3.5  │ ... │ │
│  │ 3  │ Jane │ 2.8  │ 3.2  │ ... │ │
│  └────┴──────┴──────┴──────┴─────┘ │
└─────────────────────────────────────┘
```

### Key Components to Build

1. **Team Summary Cards** - Show aggregate metrics
2. **Team Members Table** - List all direct reports with performance metrics
3. **Employee Detail View** - Drill down into individual performance
4. **Performance Charts** - Visualize competencies (radar chart, bar chart)

---

## Step 6: Important Security Notes

### ✅ DO:
- Use the `anon` key in your Next.js client code
- Let RLS handle authorization (don't bypass it)
- Always get user from `supabase.auth.getUser()`
- Filter queries with `or(\`id.eq.${user.id},manager_id.eq.${user.id}\`)`

### ❌ DON'T:
- Don't use the `service_role` key in client-side code
- Don't trust user input for filtering (let RLS handle it)
- Don't expose employee UUIDs in URLs (use employee_code instead)

---

## Common Queries You'll Need

See `example_queries.sql` for all the queries, but here are the most important ones:

### 1. Get Team Members
```sql
SELECT * FROM employees
WHERE id = auth.uid() OR manager_id = auth.uid();
```

### 2. Get Team Performance
```sql
SELECT e.*, pe.*
FROM employees e
LEFT JOIN performance_evaluations pe ON e.id = pe.employee_id
WHERE (e.id = auth.uid() OR e.manager_id = auth.uid())
AND pe.evaluation_year = 2024;
```

### 3. Get Team Summary Stats
```sql
SELECT
  COUNT(*) FILTER (WHERE e.id != auth.uid()) as direct_reports,
  ROUND(AVG(pe.general_potential), 2) as avg_potential,
  ROUND(AVG(pe.competencies_avg_score), 2) as avg_competencies
FROM employees e
LEFT JOIN performance_evaluations pe ON e.id = pe.employee_id
WHERE e.manager_id = auth.uid();
```

---

## Troubleshooting

### Problem: Queries return empty results
**Solution**:
- Verify the logged-in user's UUID exists in the employees table
- Check that manager_id relationships are set correctly
- Test RLS policies manually (see Step 3)

### Problem: Can't see all team members
**Solution**:
- Ensure you're using `OR` condition: `id.eq.${user.id},manager_id.eq.${user.id}`
- Check that the manager_id field is populated correctly

### Problem: Auth user doesn't match employee
**Solution**:
- The auth.users.id MUST match employees.id for managers
- Use the UUID update script from Step 2

---

## Example: Complete Dashboard Component

```typescript
// app/dashboard/page.tsx
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  // Get current employee info
  const { data: currentEmployee } = await supabase
    .from('employees')
    .select('*')
    .eq('id', user.id)
    .single();

  // Get team performance data
  const { data: teamData } = await supabase
    .rpc('get_team_performance', {
      manager_uuid: user.id,
      eval_year: 2024
    });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">
        Welcome, {currentEmployee?.first_name}!
      </h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Direct Reports"
          value={teamData?.length - 1 || 0}
        />
        <StatCard
          title="Avg Performance"
          value={calculateAvg(teamData, 'general_potential')}
        />
        <StatCard
          title="Avg Competencies"
          value={calculateAvg(teamData, 'competencies_avg_score')}
        />
      </div>

      <TeamTable data={teamData} currentUserId={user.id} />
    </div>
  );
}
```

---

## Resources

- **Supabase Docs**: https://supabase.com/docs
- **RLS Guide**: https://supabase.com/docs/guides/auth/row-level-security
- **Next.js + Supabase**: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs

---

## Summary Checklist

- [ ] Run verification queries from `verify_import.sql`
- [ ] Save manager UUIDs
- [ ] Create auth accounts for all managers
- [ ] Test RLS policies
- [ ] Set up Supabase client in Next.js
- [ ] Build dashboard page that queries team data
- [ ] Test login as a manager and verify data shows correctly
- [ ] Build employee detail view
- [ ] Add performance visualizations

You're all set! 🚀
