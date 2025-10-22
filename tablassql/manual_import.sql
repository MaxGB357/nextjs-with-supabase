-- ============================================================================
-- MANUAL CSV IMPORT - ALL-IN-ONE SQL SCRIPT
-- ============================================================================
--
-- INSTRUCTIONS:
-- 1. First, run schema.sql to create all tables
-- 2. Then, run PART 1 of this script (temporary tables)
-- 3. Import your CSV files via Supabase Dashboard (see MANUAL_IMPORT_GUIDE.md)
-- 4. Finally, run PART 2 of this script (data processing)
--
-- ============================================================================

-- ============================================================================
-- PART 1: CREATE TEMPORARY TABLES (Run this FIRST)
-- ============================================================================

-- Drop existing temp tables if they exist
DROP TABLE IF EXISTS temp_hierarchy CASCADE;
DROP TABLE IF EXISTS temp_performance CASCADE;

-- Temporary table for hierarchy data (jefaturacsv.csv)
CREATE TABLE temp_hierarchy (
    id INTEGER,
    nombre VARCHAR(100),
    apellido VARCHAR(100),
    identifier INTEGER,
    nombre_categoria VARCHAR(100)
);

-- Temporary table for performance data (datageneralcsv.csv)
-- Note: Column names are simplified to avoid issues with special characters
CREATE TABLE temp_performance (
    id INTEGER,
    nombre VARCHAR(100),
    apellido VARCHAR(100),
    rut VARCHAR(12),
    email VARCHAR(255),
    general_potencial VARCHAR(10),
    general_potencial_etiqueta VARCHAR(50),
    par_cliente_score VARCHAR(10),
    par_cliente_etiqueta VARCHAR(50),
    jefe_directo_score VARCHAR(10),
    jefe_directo_etiqueta VARCHAR(50),
    promedio_competencias_score VARCHAR(10),
    promedio_competencias_etiqueta VARCHAR(50),
    somos_un_solo_equipo_score VARCHAR(10),
    somos_un_solo_equipo_etiqueta VARCHAR(50),
    nos_movemos_agilmente_score VARCHAR(10),
    nos_movemos_agilmente_etiqueta VARCHAR(50),
    nos_apasionamos_cliente_score VARCHAR(10),
    nos_apasionamos_cliente_etiqueta VARCHAR(50),
    cuidamos_futuro_score VARCHAR(10),
    cuidamos_futuro_etiqueta VARCHAR(50)
);

-- ============================================================================
-- NOW: IMPORT YOUR CSV FILES VIA SUPABASE DASHBOARD
-- ============================================================================
-- Go to Table Editor → temp_hierarchy → Insert → Import CSV
-- Then go to temp_performance → Insert → Import CSV
-- After importing, come back and run PART 2 below
-- ============================================================================


-- ============================================================================
-- PART 2: PROCESS AND IMPORT DATA (Run this AFTER CSV import)
-- ============================================================================

-- Helper function to convert string to decimal (handles NULL, '-', and empty strings)
CREATE OR REPLACE FUNCTION safe_to_decimal(val TEXT)
RETURNS DECIMAL(3,2) AS $$
BEGIN
    IF val IS NULL OR val = '-' OR TRIM(val) = '' THEN
        RETURN NULL;
    END IF;
    RETURN CAST(REPLACE(val, ',', '.') AS DECIMAL(3,2));
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a mapping table for employee codes to UUIDs
-- This ensures consistent UUIDs for each employee
DROP TABLE IF EXISTS employee_uuid_mapping;
CREATE TEMP TABLE employee_uuid_mapping AS
SELECT DISTINCT
    id AS employee_code,
    gen_random_uuid() AS uuid
FROM temp_hierarchy;

-- Display the mapping (IMPORTANT: Save this output!)
SELECT
    employee_code,
    uuid,
    'Save this mapping!' AS note
FROM employee_uuid_mapping
ORDER BY employee_code;

-- ============================================================================
-- INSERT EMPLOYEES
-- ============================================================================

INSERT INTO employees (id, employee_code, first_name, last_name, rut, email, manager_id)
SELECT
    eum.uuid,
    th.id,
    th.nombre,
    th.apellido,
    tp.rut,
    tp.email,
    (SELECT uuid FROM employee_uuid_mapping WHERE employee_code = th.identifier) AS manager_id
FROM temp_hierarchy th
JOIN temp_performance tp ON th.id = tp.id
JOIN employee_uuid_mapping eum ON th.id = eum.employee_code
ON CONFLICT (employee_code) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    rut = EXCLUDED.rut,
    email = EXCLUDED.email,
    manager_id = EXCLUDED.manager_id;

-- Verify employees
SELECT
    'Employees imported:' AS status,
    COUNT(*) AS count
FROM employees;

-- ============================================================================
-- INSERT PERFORMANCE EVALUATIONS
-- ============================================================================

INSERT INTO performance_evaluations (
    employee_id,
    evaluation_year,
    general_potential,
    general_potential_label,
    peer_client_score,
    peer_client_label,
    direct_manager_score,
    direct_manager_label,
    competencies_avg_score,
    competencies_avg_label,
    somos_un_solo_equipo_score,
    somos_un_solo_equipo_label,
    nos_movemos_agilmente_score,
    nos_movemos_agilmente_label,
    nos_apasionamos_por_cliente_score,
    nos_apasionamos_por_cliente_label,
    cuidamos_el_futuro_score,
    cuidamos_el_futuro_label
)
SELECT
    eum.uuid,
    2024, -- ⚠️ CHANGE THIS TO YOUR EVALUATION YEAR
    safe_to_decimal(tp.general_potencial),
    tp.general_potencial_etiqueta,
    safe_to_decimal(tp.par_cliente_score),
    tp.par_cliente_etiqueta,
    safe_to_decimal(tp.jefe_directo_score),
    tp.jefe_directo_etiqueta,
    safe_to_decimal(tp.promedio_competencias_score),
    tp.promedio_competencias_etiqueta,
    safe_to_decimal(tp.somos_un_solo_equipo_score),
    tp.somos_un_solo_equipo_etiqueta,
    safe_to_decimal(tp.nos_movemos_agilmente_score),
    tp.nos_movemos_agilmente_etiqueta,
    safe_to_decimal(tp.nos_apasionamos_cliente_score),
    tp.nos_apasionamos_cliente_etiqueta,
    safe_to_decimal(tp.cuidamos_futuro_score),
    tp.cuidamos_futuro_etiqueta
FROM temp_performance tp
JOIN employee_uuid_mapping eum ON tp.id = eum.employee_code
ON CONFLICT (employee_id, evaluation_year) DO UPDATE SET
    general_potential = EXCLUDED.general_potential,
    general_potential_label = EXCLUDED.general_potential_label,
    peer_client_score = EXCLUDED.peer_client_score,
    peer_client_label = EXCLUDED.peer_client_label,
    direct_manager_score = EXCLUDED.direct_manager_score,
    direct_manager_label = EXCLUDED.direct_manager_label,
    competencies_avg_score = EXCLUDED.competencies_avg_score,
    competencies_avg_label = EXCLUDED.competencies_avg_label,
    somos_un_solo_equipo_score = EXCLUDED.somos_un_solo_equipo_score,
    somos_un_solo_equipo_label = EXCLUDED.somos_un_solo_equipo_label,
    nos_movemos_agilmente_score = EXCLUDED.nos_movemos_agilmente_score,
    nos_movemos_agilmente_label = EXCLUDED.nos_movemos_agilmente_label,
    nos_apasionamos_por_cliente_score = EXCLUDED.nos_apasionamos_por_cliente_score,
    nos_apasionamos_por_cliente_label = EXCLUDED.nos_apasionamos_por_cliente_label,
    cuidamos_el_futuro_score = EXCLUDED.cuidamos_el_futuro_score,
    cuidamos_el_futuro_label = EXCLUDED.cuidamos_el_futuro_label;

-- Verify evaluations
SELECT
    'Performance evaluations imported:' AS status,
    COUNT(*) AS count
FROM performance_evaluations;

-- ============================================================================
-- VERIFICATION AND REPORTING
-- ============================================================================

-- Show complete employee list with roles
SELECT
    e.employee_code,
    e.first_name || ' ' || e.last_name AS full_name,
    e.email,
    e.id AS uuid,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM employees e2 WHERE e2.manager_id = e.id
        ) THEN '⭐ MANAGER'
        ELSE 'Employee'
    END AS role,
    COALESCE(m.first_name || ' ' || m.last_name, 'No manager') AS reports_to
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id
ORDER BY e.employee_code;

-- Show managers with their direct report counts
SELECT
    m.employee_code AS manager_code,
    m.first_name || ' ' || m.last_name AS manager_name,
    m.email AS manager_email,
    m.id AS manager_uuid,
    COUNT(e.id) AS direct_reports_count,
    STRING_AGG(e.first_name || ' ' || e.last_name, ', ') AS direct_reports
FROM employees m
JOIN employees e ON e.manager_id = m.id
GROUP BY m.id, m.employee_code, m.first_name, m.last_name, m.email
ORDER BY direct_reports_count DESC;

-- Show sample performance data
SELECT
    e.employee_code,
    e.first_name || ' ' || e.last_name AS full_name,
    pe.evaluation_year,
    pe.general_potential,
    pe.general_potential_label,
    pe.competencies_avg_score,
    pe.competencies_avg_label
FROM employees e
JOIN performance_evaluations pe ON e.id = pe.employee_id
ORDER BY e.employee_code
LIMIT 10;

-- Summary statistics
SELECT
    '📊 Import Summary' AS report,
    '' AS detail
UNION ALL
SELECT
    'Total Employees',
    COUNT(*)::TEXT
FROM employees
UNION ALL
SELECT
    'Total Managers',
    COUNT(DISTINCT manager_id)::TEXT
FROM employees
WHERE manager_id IS NOT NULL
UNION ALL
SELECT
    'Total Evaluations',
    COUNT(*)::TEXT
FROM performance_evaluations
UNION ALL
SELECT
    'Evaluation Year(s)',
    STRING_AGG(DISTINCT evaluation_year::TEXT, ', ')
FROM performance_evaluations;

-- ============================================================================
-- OPTIONAL: CLEAN UP TEMPORARY TABLES
-- ============================================================================
-- Uncomment these lines after you've verified everything is correct

-- DROP TABLE IF EXISTS temp_hierarchy;
-- DROP TABLE IF EXISTS temp_performance;
-- DROP FUNCTION IF EXISTS safe_to_decimal(TEXT);

-- ============================================================================
-- IMPORTANT: NEXT STEPS
-- ============================================================================

/*
1. SAVE THE MANAGER UUIDs
   Copy the UUIDs from the "⭐ MANAGER" rows above.
   You'll need these to create auth accounts.

2. CREATE AUTH ACCOUNTS FOR MANAGERS
   For each manager, run:

   INSERT INTO auth.users (
       instance_id,
       id,
       aud,
       role,
       email,
       encrypted_password,
       email_confirmed_at,
       created_at,
       updated_at,
       raw_app_meta_data,
       raw_user_meta_data,
       is_super_admin,
       confirmation_token
   )
   VALUES (
       '00000000-0000-0000-0000-000000000000',
       'paste-manager-uuid-here',
       'authenticated',
       'authenticated',
       'manager@example.com',
       crypt('temporary_password', gen_salt('bf')),
       NOW(),
       NOW(),
       NOW(),
       '{"provider":"email","providers":["email"]}',
       '{}',
       FALSE,
       ''
   );

   OR use Supabase Auth UI to create accounts, then UPDATE the employees table
   to use those UUIDs.

3. TEST RLS POLICIES
   Try querying as a specific manager:

   SET ROLE authenticated;
   SET request.jwt.claims = '{"sub": "manager-uuid-here"}';
   SELECT * FROM employees;
   SELECT * FROM performance_evaluations;
   RESET ROLE;

4. BUILD YOUR NEXT.JS UI
   Use the queries from example_queries.sql
*/
