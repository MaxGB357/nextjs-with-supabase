-- ============================================================================
-- EXAMPLE QUERIES FOR EMPLOYEE PERFORMANCE MANAGEMENT SYSTEM
-- ============================================================================

-- ============================================================================
-- COMMON QUERIES FOR WEB APP
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Query 1: Get all team members (manager + direct reports) for logged-in user
-- ----------------------------------------------------------------------------
-- Use case: Display team roster when manager logs in
-- This respects RLS automatically

SELECT
    e.id,
    e.employee_code,
    e.first_name,
    e.last_name,
    e.email,
    e.rut,
    CASE
        WHEN e.id = auth.uid() THEN 'Manager (You)'
        ELSE 'Direct Report'
    END AS role
FROM employees e
WHERE
    e.id = auth.uid()  -- Include the manager themselves
    OR e.manager_id = auth.uid()  -- Include their direct reports
ORDER BY
    CASE WHEN e.id = auth.uid() THEN 0 ELSE 1 END,  -- Manager first
    e.last_name,
    e.first_name;

-- ----------------------------------------------------------------------------
-- Query 2: Get team performance data for current year
-- ----------------------------------------------------------------------------
-- Use case: Dashboard showing all team members' performance metrics

SELECT
    e.id,
    e.employee_code,
    e.first_name || ' ' || e.last_name AS full_name,
    e.email,
    pe.general_potential,
    pe.general_potential_label,
    pe.competencies_avg_score,
    pe.competencies_avg_label,
    pe.direct_manager_score,
    pe.direct_manager_label,
    pe.somos_un_solo_equipo_score,
    pe.nos_movemos_agilmente_score,
    pe.nos_apasionamos_por_cliente_score,
    pe.cuidamos_el_futuro_score
FROM employees e
LEFT JOIN performance_evaluations pe
    ON e.id = pe.employee_id
    AND pe.evaluation_year = EXTRACT(YEAR FROM CURRENT_DATE)
WHERE
    e.id = auth.uid()
    OR e.manager_id = auth.uid()
ORDER BY
    CASE WHEN e.id = auth.uid() THEN 0 ELSE 1 END,
    e.last_name,
    e.first_name;

-- ----------------------------------------------------------------------------
-- Query 3: Get detailed performance for a specific employee (with comments)
-- ----------------------------------------------------------------------------
-- Use case: Drill-down view for a specific employee's performance
-- Replace :employee_id with actual employee UUID

SELECT
    e.id,
    e.first_name || ' ' || e.last_name AS full_name,
    e.email,
    pe.evaluation_year,
    pe.general_potential,
    pe.general_potential_label,
    pe.peer_client_score,
    pe.peer_client_label,
    pe.direct_manager_score,
    pe.direct_manager_label,
    pe.competencies_avg_score,
    pe.competencies_avg_label,
    pe.somos_un_solo_equipo_score,
    pe.somos_un_solo_equipo_label,
    pe.nos_movemos_agilmente_score,
    pe.nos_movemos_agilmente_label,
    pe.nos_apasionamos_por_cliente_score,
    pe.nos_apasionamos_por_cliente_label,
    pe.cuidamos_el_futuro_score,
    pe.cuidamos_el_futuro_label,
    -- Get all comments as JSON
    (
        SELECT json_object_agg(ec.category, ec.comment_text)
        FROM evaluation_comments ec
        WHERE ec.evaluation_id = pe.id
    ) AS comments
FROM employees e
LEFT JOIN performance_evaluations pe
    ON e.id = pe.employee_id
WHERE
    e.id = :employee_id
    AND (e.id = auth.uid() OR e.manager_id = auth.uid())  -- RLS check
ORDER BY pe.evaluation_year DESC;

-- ----------------------------------------------------------------------------
-- Query 4: Get team performance summary statistics
-- ----------------------------------------------------------------------------
-- Use case: Show aggregated team metrics

SELECT
    COUNT(*) FILTER (WHERE e.id != auth.uid()) AS direct_reports_count,
    ROUND(AVG(pe.general_potential), 2) AS avg_team_potential,
    ROUND(AVG(pe.competencies_avg_score), 2) AS avg_team_competencies,
    ROUND(AVG(pe.direct_manager_score), 2) AS avg_manager_score,
    COUNT(*) FILTER (WHERE pe.general_potential >= 3.0) AS high_performers_count,
    COUNT(*) FILTER (WHERE pe.general_potential < 2.5) AS needs_improvement_count
FROM employees e
LEFT JOIN performance_evaluations pe
    ON e.id = pe.employee_id
    AND pe.evaluation_year = EXTRACT(YEAR FROM CURRENT_DATE)
WHERE
    e.manager_id = auth.uid();  -- Only direct reports, not the manager themselves

-- ----------------------------------------------------------------------------
-- Query 5: Compare performance across years for an employee
-- ----------------------------------------------------------------------------
-- Use case: Historical performance tracking

SELECT
    e.first_name || ' ' || e.last_name AS full_name,
    pe.evaluation_year,
    pe.general_potential,
    pe.competencies_avg_score,
    pe.direct_manager_score,
    -- Calculate year-over-year change
    LAG(pe.general_potential) OVER (ORDER BY pe.evaluation_year) AS previous_year_potential,
    pe.general_potential - LAG(pe.general_potential) OVER (ORDER BY pe.evaluation_year) AS potential_change
FROM employees e
JOIN performance_evaluations pe ON e.id = pe.employee_id
WHERE
    e.id = :employee_id
    AND (e.id = auth.uid() OR e.manager_id = auth.uid())  -- RLS check
ORDER BY pe.evaluation_year DESC;

-- ============================================================================
-- USING HELPER FUNCTIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Using get_direct_reports function
-- ----------------------------------------------------------------------------
-- Get list of all direct reports for logged-in manager

SELECT * FROM get_direct_reports(auth.uid());

-- ----------------------------------------------------------------------------
-- Using get_team_performance function
-- ----------------------------------------------------------------------------
-- Get team performance for current year

SELECT * FROM get_team_performance(auth.uid(), EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER);

-- Get team performance for specific year (e.g., 2024)
SELECT * FROM get_team_performance(auth.uid(), 2024);

-- ============================================================================
-- ADMIN QUERIES (Using service_role, not subject to RLS)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Get all employees without managers (top-level employees)
-- ----------------------------------------------------------------------------
SELECT
    id,
    employee_code,
    first_name || ' ' || e.last_name AS full_name,
    email
FROM employees e
WHERE manager_id IS NULL;

-- ----------------------------------------------------------------------------
-- Get count of direct reports per manager
-- ----------------------------------------------------------------------------
SELECT
    m.id AS manager_id,
    m.first_name || ' ' || m.last_name AS manager_name,
    COUNT(e.id) AS direct_reports_count
FROM employees m
LEFT JOIN employees e ON e.manager_id = m.id
WHERE m.id IN (SELECT DISTINCT manager_id FROM employees WHERE manager_id IS NOT NULL)
GROUP BY m.id, m.first_name, m.last_name
ORDER BY direct_reports_count DESC;

-- ----------------------------------------------------------------------------
-- Get all employees missing performance evaluations for a year
-- ----------------------------------------------------------------------------
SELECT
    e.id,
    e.employee_code,
    e.first_name || ' ' || e.last_name AS full_name,
    e.email
FROM employees e
WHERE NOT EXISTS (
    SELECT 1
    FROM performance_evaluations pe
    WHERE pe.employee_id = e.id
    AND pe.evaluation_year = 2024  -- Replace with desired year
);

-- ============================================================================
-- USEFUL NEXTJS/SUPABASE CLIENT QUERIES
-- ============================================================================

-- These are examples of how you'd structure queries in your Next.js app
-- using the Supabase JavaScript client

/*
// Example 1: Get team members with performance data
const { data: teamData, error } = await supabase
  .from('employees')
  .select(`
    id,
    employee_code,
    first_name,
    last_name,
    email,
    performance_evaluations!inner (
      evaluation_year,
      general_potential,
      general_potential_label,
      competencies_avg_score,
      competencies_avg_label
    )
  `)
  .or(`id.eq.${userId},manager_id.eq.${userId}`)
  .eq('performance_evaluations.evaluation_year', currentYear);

// Example 2: Get direct reports only
const { data: directReports, error } = await supabase
  .from('employees')
  .select('id, employee_code, first_name, last_name, email')
  .eq('manager_id', userId);

// Example 3: Get detailed performance with comments
const { data: performanceDetail, error } = await supabase
  .from('performance_evaluations')
  .select(`
    *,
    employees!inner (
      id,
      first_name,
      last_name,
      email
    ),
    evaluation_comments (
      category,
      comment_text
    )
  `)
  .eq('employee_id', employeeId)
  .eq('evaluation_year', year)
  .single();

// Example 4: Using RPC (helper functions)
const { data: teamPerformance, error } = await supabase
  .rpc('get_team_performance', {
    manager_uuid: userId,
    eval_year: 2024
  });
*/
