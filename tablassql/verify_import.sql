-- ============================================================================
-- VERIFICATION QUERIES - Run these to verify your data import
-- ============================================================================

-- ============================================================================
-- 1. CHECK DATA COUNTS
-- ============================================================================

SELECT
    '📊 Data Import Summary' AS report,
    '' AS value
UNION ALL
SELECT
    'Total Employees',
    COUNT(*)::TEXT
FROM employees
UNION ALL
SELECT
    'Total Performance Evaluations',
    COUNT(*)::TEXT
FROM performance_evaluations
UNION ALL
SELECT
    'Total Evaluation Comments',
    COUNT(*)::TEXT
FROM evaluation_comments;

-- ============================================================================
-- 2. VIEW ALL EMPLOYEES
-- ============================================================================

SELECT
    e.employee_code,
    e.first_name,
    e.last_name,
    e.email,
    e.rut,
    e.id AS employee_uuid,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM employees e2 WHERE e2.manager_id = e.id
        ) THEN '⭐ MANAGER'
        ELSE 'Employee'
    END AS role
FROM employees e
ORDER BY e.employee_code;

-- ============================================================================
-- 3. VIEW ORGANIZATIONAL HIERARCHY
-- ============================================================================

SELECT
    e.employee_code AS employee_code,
    e.first_name || ' ' || e.last_name AS employee_name,
    e.email AS employee_email,
    COALESCE(m.first_name || ' ' || m.last_name, 'No Manager') AS reports_to,
    m.employee_code AS manager_code,
    m.id AS manager_uuid
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id
ORDER BY m.employee_code, e.employee_code;

-- ============================================================================
-- 4. VIEW MANAGERS WITH THEIR DIRECT REPORTS
-- ============================================================================

SELECT
    m.employee_code AS manager_code,
    m.first_name || ' ' || m.last_name AS manager_name,
    m.email AS manager_email,
    m.id AS manager_uuid,
    COUNT(e.id) AS direct_reports_count,
    STRING_AGG(
        e.employee_code::TEXT || ': ' || e.first_name || ' ' || e.last_name,
        ', '
    ) AS direct_reports
FROM employees m
JOIN employees e ON e.manager_id = m.id
GROUP BY m.id, m.employee_code, m.first_name, m.last_name, m.email
ORDER BY m.employee_code;

-- ⚠️ IMPORTANT: Save the manager_uuid from above!
-- You'll need these UUIDs to create auth accounts for managers

-- ============================================================================
-- 5. VIEW PERFORMANCE EVALUATIONS
-- ============================================================================

SELECT
    e.employee_code,
    e.first_name || ' ' || e.last_name AS employee_name,
    pe.evaluation_year,
    pe.general_potential,
    pe.general_potential_label,
    pe.competencies_avg_score,
    pe.competencies_avg_label,
    pe.direct_manager_score,
    pe.direct_manager_label
FROM employees e
JOIN performance_evaluations pe ON e.id = pe.employee_id
ORDER BY e.employee_code, pe.evaluation_year DESC;

-- ============================================================================
-- 6. VIEW EVALUATION COMMENTS (if any)
-- ============================================================================

SELECT
    e.employee_code,
    e.first_name || ' ' || e.last_name AS employee_name,
    ec.category,
    ec.comment_text
FROM evaluation_comments ec
JOIN performance_evaluations pe ON ec.evaluation_id = pe.id
JOIN employees e ON pe.employee_id = e.id
ORDER BY e.employee_code, ec.category;

-- ============================================================================
-- 7. CHECK FOR DATA INTEGRITY ISSUES
-- ============================================================================

-- Check for employees without email or rut
SELECT
    'Employees missing email or RUT' AS issue,
    COUNT(*)::TEXT AS count
FROM employees
WHERE email IS NULL OR rut IS NULL;

-- Check for evaluations without employees (should be 0)
SELECT
    'Orphaned evaluations (no matching employee)' AS issue,
    COUNT(*)::TEXT AS count
FROM performance_evaluations pe
WHERE NOT EXISTS (
    SELECT 1 FROM employees e WHERE e.id = pe.employee_id
);

-- Check for employees with invalid manager_id (should be 0)
SELECT
    'Employees with invalid manager_id' AS issue,
    COUNT(*)::TEXT AS count
FROM employees e
WHERE e.manager_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM employees m WHERE m.id = e.manager_id
);

-- ============================================================================
-- 8. PERFORMANCE METRICS SUMMARY
-- ============================================================================

SELECT
    pe.evaluation_year,
    COUNT(DISTINCT pe.employee_id) AS employees_evaluated,
    ROUND(AVG(pe.general_potential), 2) AS avg_general_potential,
    ROUND(AVG(pe.competencies_avg_score), 2) AS avg_competencies,
    ROUND(AVG(pe.direct_manager_score), 2) AS avg_manager_score,
    COUNT(*) FILTER (WHERE pe.general_potential >= 3.0) AS high_performers,
    COUNT(*) FILTER (WHERE pe.general_potential < 2.5) AS needs_improvement
FROM performance_evaluations pe
GROUP BY pe.evaluation_year
ORDER BY pe.evaluation_year DESC;

-- ============================================================================
-- 9. TEST RLS POLICIES (IMPORTANT!)
-- ============================================================================

-- First, get a manager UUID from query #4 above, then test RLS:

-- Example: Replace 'YOUR-MANAGER-UUID-HERE' with actual UUID from query #4
/*
SET ROLE authenticated;
SET request.jwt.claims = '{"sub": "YOUR-MANAGER-UUID-HERE"}';

-- This should only show the manager and their direct reports
SELECT
    employee_code,
    first_name,
    last_name,
    email
FROM employees
ORDER BY employee_code;

-- This should only show evaluations for the manager and their direct reports
SELECT
    e.employee_code,
    e.first_name || ' ' || e.last_name AS name,
    pe.general_potential,
    pe.competencies_avg_score
FROM performance_evaluations pe
JOIN employees e ON pe.employee_id = e.id
ORDER BY e.employee_code;

-- Reset to admin view
RESET ROLE;
*/

-- ============================================================================
-- 10. SAMPLE QUERY FOR YOUR WEBAPP
-- ============================================================================

-- This is what your webapp will typically query when a manager logs in
-- Replace 'YOUR-MANAGER-UUID-HERE' with actual manager UUID

/*
-- Get team members with their latest performance data
SELECT
    e.employee_code,
    e.first_name,
    e.last_name,
    e.email,
    CASE WHEN e.id = 'YOUR-MANAGER-UUID-HERE' THEN true ELSE false END AS is_me,
    pe.general_potential,
    pe.general_potential_label,
    pe.competencies_avg_score,
    pe.competencies_avg_label,
    pe.somos_un_solo_equipo_score,
    pe.nos_movemos_agilmente_score,
    pe.nos_apasionamos_por_cliente_score,
    pe.cuidamos_el_futuro_score,
    pe.evaluation_year
FROM employees e
LEFT JOIN performance_evaluations pe
    ON e.id = pe.employee_id
    AND pe.evaluation_year = (
        SELECT MAX(evaluation_year)
        FROM performance_evaluations
    )
WHERE
    e.id = 'YOUR-MANAGER-UUID-HERE'  -- Include manager
    OR e.manager_id = 'YOUR-MANAGER-UUID-HERE'  -- Include direct reports
ORDER BY
    CASE WHEN e.id = 'YOUR-MANAGER-UUID-HERE' THEN 0 ELSE 1 END,
    e.last_name,
    e.first_name;
*/

-- ============================================================================
-- NEXT STEPS
-- ============================================================================

/*
✅ Your data is imported! Here's what to do next:

1. RUN QUERIES 1-8 ABOVE
   - Verify all your data is correct
   - Save the manager UUIDs from query #4

2. CREATE AUTH ACCOUNTS FOR MANAGERS
   - Option A: Use Supabase Dashboard → Authentication → Add User
   - Option B: Use SQL to insert into auth.users (see below)

3. TEST RLS POLICIES
   - Use query #9 to test that managers can only see their team's data

4. INTEGRATE WITH YOUR NEXT.JS APP
   - Use the example queries from example_queries.sql
   - Use the sample query in #10 as your main dashboard query

================================================================================
CREATING AUTH ACCOUNTS FOR MANAGERS (Option B - SQL Method)
================================================================================

For each manager UUID from query #4, run this SQL:

INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'PASTE-MANAGER-UUID-HERE',  -- ⚠️ Use UUID from query #4
    'authenticated',
    'authenticated',
    'manager@example.com',  -- ⚠️ Use actual email from employees table
    crypt('TemporaryPassword123!', gen_salt('bf')),  -- ⚠️ Change this password
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    FALSE,
    NOW(),
    NOW(),
    NULL,
    NULL,
    '',
    '',
    '',
    ''
);

-- Also insert into auth.identities
INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
)
VALUES (
    'PASTE-MANAGER-UUID-HERE',  -- Same UUID
    'PASTE-MANAGER-UUID-HERE',  -- Same UUID
    jsonb_build_object('sub', 'PASTE-MANAGER-UUID-HERE', 'email', 'manager@example.com'),
    'email',
    NOW(),
    NOW(),
    NOW()
);

IMPORTANT: Users will need to change their password on first login!

================================================================================
OR USE SUPABASE DASHBOARD (Easier!)
================================================================================

1. Go to Authentication → Users → Add User
2. Enter the manager's email and a temporary password
3. Copy the generated UUID
4. Update the employees table:
   UPDATE employees
   SET id = 'new-uuid-from-auth'
   WHERE employee_code = X;  -- The manager's employee code

Then update all related records:
   UPDATE employees
   SET manager_id = 'new-uuid-from-auth'
   WHERE manager_id = 'old-uuid';

   UPDATE performance_evaluations
   SET employee_id = 'new-uuid-from-auth'
   WHERE employee_id = 'old-uuid';

*/
