-- ============================================================================
-- DATABASE SCHEMA FOR EMPLOYEE PERFORMANCE MANAGEMENT SYSTEM
-- ============================================================================
-- Description: Schema for managing employee hierarchy and performance evaluations
-- Features: Direct reports hierarchy, annual performance tracking, RLS policies
-- ============================================================================

-- ============================================================================
-- TABLE: employees
-- ============================================================================
-- Stores employee information and organizational hierarchy
-- Each employee has a manager (boss) referenced by manager_id
-- Only employees who are managers will have Supabase auth accounts

CREATE TABLE employees (
    -- Primary identifier (maps to Supabase auth.users.id for managers)
    id UUID PRIMARY KEY,

    -- Employee identification
    employee_code INTEGER UNIQUE NOT NULL, -- Original numeric ID from CSV
    rut VARCHAR(12) UNIQUE NOT NULL,       -- Chilean RUT (national ID)

    -- Personal information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,

    -- Organizational hierarchy
    manager_id UUID REFERENCES employees(id), -- NULL for top-level employees

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_employees_manager_id ON employees(manager_id);
CREATE INDEX idx_employees_employee_code ON employees(employee_code);
CREATE INDEX idx_employees_email ON employees(email);

-- ============================================================================
-- TABLE: performance_evaluations
-- ============================================================================
-- Stores annual performance evaluation scores and ratings
-- Updated once per year per employee

CREATE TABLE performance_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    evaluation_year INTEGER NOT NULL,

    -- General Performance Metrics
    general_potential DECIMAL(3,2),                    -- e.g., 2.5, 3.0
    general_potential_label VARCHAR(50),               -- e.g., "Medio - (Calibrado)"

    -- Performance Categories (Score + Label)
    peer_client_score DECIMAL(3,2),
    peer_client_label VARCHAR(50),

    direct_manager_score DECIMAL(3,2),
    direct_manager_label VARCHAR(50),

    competencies_avg_score DECIMAL(3,2),
    competencies_avg_label VARCHAR(50),

    -- Individual Competencies (Score + Label)
    somos_un_solo_equipo_score DECIMAL(3,2),
    somos_un_solo_equipo_label VARCHAR(50),

    nos_movemos_agilmente_score DECIMAL(3,2),
    nos_movemos_agilmente_label VARCHAR(50),

    nos_apasionamos_por_cliente_score DECIMAL(3,2),
    nos_apasionamos_por_cliente_label VARCHAR(50),

    cuidamos_el_futuro_score DECIMAL(3,2),
    cuidamos_el_futuro_label VARCHAR(50),

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure one evaluation per employee per year
    CONSTRAINT unique_employee_year UNIQUE (employee_id, evaluation_year)
);

-- Indexes for performance
CREATE INDEX idx_perf_eval_employee_id ON performance_evaluations(employee_id);
CREATE INDEX idx_perf_eval_year ON performance_evaluations(evaluation_year);

-- ============================================================================
-- TABLE: evaluation_comments
-- ============================================================================
-- Stores text commentary for performance evaluations
-- Separated for flexibility and to keep performance_evaluations table clean

CREATE TABLE evaluation_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID NOT NULL REFERENCES performance_evaluations(id) ON DELETE CASCADE,

    -- Comment categories
    category VARCHAR(100) NOT NULL, -- e.g., 'general', 'peer_client', 'direct_manager', 'somos_un_solo_equipo', etc.
    comment_text TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure one comment per category per evaluation
    CONSTRAINT unique_evaluation_category UNIQUE (evaluation_id, category)
);

-- Indexes for performance
CREATE INDEX idx_eval_comments_evaluation_id ON evaluation_comments(evaluation_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_comments ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- EMPLOYEES TABLE POLICIES
-- ----------------------------------------------------------------------------

-- Policy: Managers can view their own record and their direct reports
CREATE POLICY "Managers can view their team"
    ON employees
    FOR SELECT
    USING (
        -- User can see themselves
        auth.uid() = id
        OR
        -- User can see their direct reports
        auth.uid() = manager_id
    );

-- Policy: No inserts/updates/deletes for regular users (admin only via service role)
CREATE POLICY "Only service role can modify employees"
    ON employees
    FOR ALL
    USING (false);

-- ----------------------------------------------------------------------------
-- PERFORMANCE_EVALUATIONS TABLE POLICIES
-- ----------------------------------------------------------------------------

-- Policy: Managers can view evaluations for themselves and their direct reports
CREATE POLICY "Managers can view their team evaluations"
    ON performance_evaluations
    FOR SELECT
    USING (
        employee_id IN (
            SELECT id FROM employees
            WHERE id = auth.uid()  -- Own evaluation
            OR manager_id = auth.uid()  -- Direct reports' evaluations
        )
    );

-- Policy: No inserts/updates/deletes for regular users (admin only via service role)
CREATE POLICY "Only service role can modify evaluations"
    ON performance_evaluations
    FOR ALL
    USING (false);

-- ----------------------------------------------------------------------------
-- EVALUATION_COMMENTS TABLE POLICIES
-- ----------------------------------------------------------------------------

-- Policy: Managers can view comments for their team's evaluations
CREATE POLICY "Managers can view their team evaluation comments"
    ON evaluation_comments
    FOR SELECT
    USING (
        evaluation_id IN (
            SELECT pe.id
            FROM performance_evaluations pe
            JOIN employees e ON pe.employee_id = e.id
            WHERE e.id = auth.uid()  -- Own evaluation comments
            OR e.manager_id = auth.uid()  -- Direct reports' evaluation comments
        )
    );

-- Policy: No inserts/updates/deletes for regular users (admin only via service role)
CREATE POLICY "Only service role can modify comments"
    ON evaluation_comments
    FOR ALL
    USING (false);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get all direct reports for a manager
CREATE OR REPLACE FUNCTION get_direct_reports(manager_uuid UUID)
RETURNS TABLE (
    employee_id UUID,
    employee_code INTEGER,
    full_name TEXT,
    email VARCHAR,
    rut VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id,
        e.employee_code,
        e.first_name || ' ' || e.last_name AS full_name,
        e.email,
        e.rut
    FROM employees e
    WHERE e.manager_id = manager_uuid
    ORDER BY e.last_name, e.first_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get team performance data (manager + direct reports)
CREATE OR REPLACE FUNCTION get_team_performance(manager_uuid UUID, eval_year INTEGER)
RETURNS TABLE (
    employee_id UUID,
    employee_code INTEGER,
    full_name TEXT,
    email VARCHAR,
    general_potential DECIMAL,
    general_potential_label VARCHAR,
    competencies_avg_score DECIMAL,
    competencies_avg_label VARCHAR,
    direct_manager_score DECIMAL,
    direct_manager_label VARCHAR
) AS $$
BEGIN
    RETURN QUERY
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
        pe.direct_manager_label
    FROM employees e
    LEFT JOIN performance_evaluations pe
        ON e.id = pe.employee_id AND pe.evaluation_year = eval_year
    WHERE
        e.id = manager_uuid  -- Include manager themselves
        OR e.manager_id = manager_uuid  -- Include direct reports
    ORDER BY e.last_name, e.first_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update updated_at timestamp on employees table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_evaluations_updated_at
    BEFORE UPDATE ON performance_evaluations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluation_comments_updated_at
    BEFORE UPDATE ON evaluation_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE employees IS 'Core employee information and organizational hierarchy';
COMMENT ON TABLE performance_evaluations IS 'Annual performance evaluation scores and ratings';
COMMENT ON TABLE evaluation_comments IS 'Text commentary for performance evaluation categories';

COMMENT ON FUNCTION get_direct_reports IS 'Returns all direct reports for a given manager';
COMMENT ON FUNCTION get_team_performance IS 'Returns performance data for manager and their direct reports';
