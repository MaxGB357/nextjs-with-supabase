# Manual CSV Import Guide

This guide walks you through importing your CSV data manually via the Supabase Dashboard - much simpler than dealing with the Node.js script!

## Step-by-Step Instructions

### Step 1: Run the Schema

1. Open your Supabase project dashboard
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Open the `schema.sql` file and copy all its contents
5. Paste into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. You should see "Success. No rows returned"

### Step 2: Prepare Temporary Import Tables

We'll create temporary tables that match your CSV structure exactly, then process the data.

In the SQL Editor, run this:

```sql
-- ============================================================================
-- TEMPORARY TABLES FOR CSV IMPORT
-- ============================================================================

-- Temporary table for hierarchy data (jefaturacsv.csv)
CREATE TABLE IF NOT EXISTS temp_hierarchy (
    id INTEGER,
    nombre VARCHAR(100),
    apellido VARCHAR(100),
    identifier INTEGER,
    nombre_categoria VARCHAR(100)
);

-- Temporary table for performance data (datageneralcsv.csv)
CREATE TABLE IF NOT EXISTS temp_performance (
    id INTEGER,
    nombre VARCHAR(100),
    apellido VARCHAR(100),
    rut VARCHAR(12),
    email VARCHAR(255),
    general_potencial DECIMAL(3,2),
    general_potencial_etiqueta VARCHAR(50),
    par_cliente_score DECIMAL(3,2),
    par_cliente_etiqueta VARCHAR(50),
    jefe_directo_score DECIMAL(3,2),
    jefe_directo_etiqueta VARCHAR(50),
    promedio_competencias_score DECIMAL(3,2),
    promedio_competencias_etiqueta VARCHAR(50),
    somos_un_solo_equipo_score DECIMAL(3,2),
    somos_un_solo_equipo_etiqueta VARCHAR(50),
    nos_movemos_agilmente_score DECIMAL(3,2),
    nos_movemos_agilmente_etiqueta VARCHAR(50),
    nos_apasionamos_cliente_score DECIMAL(3,2),
    nos_apasionamos_cliente_etiqueta VARCHAR(50),
    cuidamos_futuro_score DECIMAL(3,2),
    cuidamos_futuro_etiqueta VARCHAR(50)
);
```

### Step 3: Import CSV Files via Dashboard

#### Import jefaturacsv.csv

1. In Supabase Dashboard, go to **Table Editor** (left sidebar)
2. Find and click on the `temp_hierarchy` table
3. Click **Insert** → **Import data from CSV**
4. Select your `jefaturacsv.csv` file
5. Map the columns:
   - `ID` → `id`
   - `Nombre` → `nombre`
   - `Apellido` → `apellido`
   - `Identifier` → `identifier`
   - `Nombre de Categoría` → `nombre_categoria`
6. Click **Import**

#### Import datageneralcsv.csv

1. In Table Editor, click on the `temp_performance` table
2. Click **Insert** → **Import data from CSV**
3. Select your `datageneralcsv.csv` file
4. Map the columns (this is the tedious part, but only do it once):
   - `ID` → `id`
   - `Nombre` → `nombre`
   - `Apellido` → `apellido`
   - `Rut` → `rut`
   - `Email` → `email`
   - `General - Potencial` → `general_potencial`
   - First `Etiqueta` after General Potencial → `general_potencial_etiqueta`
   - `Par/Cliente (Desempeño)` → `par_cliente_score`
   - Next `Etiqueta` → `par_cliente_etiqueta`
   - Continue mapping all columns...
5. Click **Import**

**Note**: If the CSV import dialog is confusing with the duplicate "Etiqueta" columns, see Alternative Method below.

### Step 4: Process the Data

Now we'll process the imported data and populate the real tables. In SQL Editor, run:

```sql
-- ============================================================================
-- PROCESS AND IMPORT DATA
-- ============================================================================

-- First, create a mapping table for employee codes to UUIDs
CREATE TEMP TABLE employee_uuid_mapping AS
SELECT DISTINCT
    id,
    gen_random_uuid() AS uuid
FROM temp_hierarchy;

-- Insert employees
INSERT INTO employees (id, employee_code, first_name, last_name, rut, email, manager_id)
SELECT
    eum.uuid,
    th.id,
    th.nombre,
    th.apellido,
    tp.rut,
    tp.email,
    (SELECT uuid FROM employee_uuid_mapping WHERE id = th.identifier) AS manager_id
FROM temp_hierarchy th
JOIN temp_performance tp ON th.id = tp.id
JOIN employee_uuid_mapping eum ON th.id = eum.id
ON CONFLICT (employee_code) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    rut = EXCLUDED.rut,
    email = EXCLUDED.email,
    manager_id = EXCLUDED.manager_id;

-- Insert performance evaluations
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
    2024, -- Change to your evaluation year
    tp.general_potencial,
    tp.general_potencial_etiqueta,
    tp.par_cliente_score,
    tp.par_cliente_etiqueta,
    tp.jefe_directo_score,
    tp.jefe_directo_etiqueta,
    tp.promedio_competencias_score,
    tp.promedio_competencias_etiqueta,
    tp.somos_un_solo_equipo_score,
    tp.somos_un_solo_equipo_etiqueta,
    tp.nos_movemos_agilmente_score,
    tp.nos_movemos_agilmente_etiqueta,
    tp.nos_apasionamos_cliente_score,
    tp.nos_apasionamos_cliente_etiqueta,
    tp.cuidamos_futuro_score,
    tp.cuidamos_futuro_etiqueta
FROM temp_performance tp
JOIN employee_uuid_mapping eum ON tp.id = eum.id
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

-- Verify the import
SELECT 'Employees imported:' AS status, COUNT(*) AS count FROM employees
UNION ALL
SELECT 'Evaluations imported:' AS status, COUNT(*) AS count FROM performance_evaluations;

-- Show the UUID mapping (SAVE THIS! You'll need it to know which UUIDs are managers)
SELECT
    e.employee_code,
    e.first_name,
    e.last_name,
    e.email,
    e.id AS uuid,
    CASE WHEN EXISTS (
        SELECT 1 FROM employees e2 WHERE e2.manager_id = e.id
    ) THEN 'MANAGER' ELSE 'Employee' END AS role
FROM employees e
ORDER BY e.employee_code;
```

### Step 5: Save Manager UUIDs

The last query shows which employees are managers. **Save the UUIDs** for employees marked as "MANAGER" - you'll need these to:
1. Create Supabase auth accounts
2. Test your application

### Step 6: Clean Up (Optional)

Once everything is working, you can drop the temporary tables:

```sql
DROP TABLE IF EXISTS temp_hierarchy;
DROP TABLE IF EXISTS temp_performance;
```

## Alternative Method: Direct SQL INSERT

If the CSV import is too confusing, you can also copy your CSV data and use SQL INSERT statements:

1. Open your CSV in Excel/Google Sheets
2. Create INSERT statements like:

```sql
INSERT INTO temp_hierarchy (id, nombre, apellido, identifier, nombre_categoria) VALUES
(1, 'Anibal', 'Retamal', 2, 'Jefe Directo'),
(2, 'Alvaro', 'Marquez', 2, 'Jefe Directo'),
(3, 'Paula', 'Roa', 2, 'Jefe Directo'),
(4, 'Angeles', 'Zuñiga', 2, 'Jefe Directo');

-- Repeat for all rows
```

3. Run these INSERT statements in SQL Editor
4. Continue with Step 4 above

## Verification

After import, verify your data:

```sql
-- Check employees
SELECT * FROM employees LIMIT 10;

-- Check performance evaluations
SELECT * FROM performance_evaluations LIMIT 10;

-- Check hierarchy (manager with direct reports)
SELECT
    m.first_name || ' ' || m.last_name AS manager,
    e.first_name || ' ' || e.last_name AS direct_report
FROM employees e
JOIN employees m ON e.manager_id = m.id
ORDER BY manager;

-- Test RLS as a specific user
SET ROLE authenticated;
SET request.jwt.claims = '{"sub": "paste-manager-uuid-here"}';
SELECT * FROM employees;
RESET ROLE;
```

## Next Steps

1. **Create Auth Accounts**: For each manager UUID, create a Supabase auth account
2. **Test Login**: Try logging in as a manager and querying the data
3. **Build Your UI**: Use the example queries from `example_queries.sql`

## Tips

- Keep a spreadsheet of employee_code → UUID → email mappings
- Start with a small dataset to test the process
- You can re-run Step 4 safely (it uses ON CONFLICT to update existing records)
- The temp tables can be dropped after successful import

## Troubleshooting

**Problem**: Import fails with "violates foreign key constraint"
- **Solution**: Make sure all `identifier` values in jefaturacsv.csv have corresponding `id` values

**Problem**: Can't see any data when logged in as a user
- **Solution**: Make sure the user's UUID exists in the employees table and matches their auth.users.id

**Problem**: Duplicate "Etiqueta" columns are confusing
- **Solution**: Rename the columns in Excel before import, or use the SQL INSERT method instead
