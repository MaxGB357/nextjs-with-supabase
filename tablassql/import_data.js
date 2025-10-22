/**
 * ============================================================================
 * DATA IMPORT SCRIPT FOR EMPLOYEE PERFORMANCE MANAGEMENT SYSTEM
 * ============================================================================
 *
 * This script imports employee and performance data from CSV files into Supabase
 *
 * Prerequisites:
 * - Node.js installed
 * - Supabase project created
 * - Schema.sql executed in Supabase
 * - npm install csv-parse @supabase/supabase-js uuid
 *
 * Environment variables needed:
 * - SUPABASE_URL: Your Supabase project URL
 * - SUPABASE_SERVICE_ROLE_KEY: Your service role key (for bypassing RLS)
 *
 * Usage:
 * node import_data.js
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// ============================================================================
// LOAD ENVIRONMENT VARIABLES
// ============================================================================

// Try to load .env.local first, then .env
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
    // CSV file paths
    csvFiles: {
        hierarchy: './jefaturacsv.csv',
        performance: './datageneralcsv.csv'
    },

    // Evaluation year for the data being imported
    evaluationYear: 2024,

    // Supabase configuration
    supabase: {
        url: process.env.SUPABASE_URL,
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
    }
};

// ============================================================================
// INITIALIZE SUPABASE CLIENT
// ============================================================================

if (!CONFIG.supabase.url || !CONFIG.supabase.serviceRoleKey) {
    console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required');
    console.error('   Set them in a .env file or export them in your shell');
    process.exit(1);
}

const supabase = createClient(
    CONFIG.supabase.url,
    CONFIG.supabase.serviceRoleKey,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Parse CSV file and return records
 */
function parseCSV(filePath) {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        // Remove BOM if present
        const cleanContent = fileContent.replace(/^\uFEFF/, '');

        const records = parse(cleanContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
            bom: true
        });

        return records;
    } catch (error) {
        console.error(`❌ Error reading CSV file ${filePath}:`, error.message);
        throw error;
    }
}

/**
 * Convert string value to decimal or null
 */
function toDecimal(value) {
    if (!value || value === '-' || value.trim() === '') {
        return null;
    }
    const parsed = parseFloat(value.replace(',', '.'));
    return isNaN(parsed) ? null : parsed;
}

/**
 * Clean and normalize string values
 */
function cleanString(value) {
    if (!value || value === '-') {
        return null;
    }
    return value.trim();
}

// ============================================================================
// DATA PROCESSING FUNCTIONS
// ============================================================================

/**
 * Process hierarchy CSV and create employee mapping
 * Returns: { employees: [], managerMap: {} }
 */
function processHierarchyData(hierarchyRecords) {
    console.log('\n📊 Processing hierarchy data...');

    const employees = [];
    const managerMap = {}; // Map employee_code -> manager_code
    const employeeCodeToUUID = {}; // Map employee_code -> UUID

    // First pass: Create UUIDs for all employees
    for (const record of hierarchyRecords) {
        const employeeCode = parseInt(record.ID);
        const uuid = uuidv4();
        employeeCodeToUUID[employeeCode] = uuid;

        console.log(`   Employee ${employeeCode} (${record.Nombre} ${record.Apellido}) -> UUID: ${uuid}`);
    }

    // Second pass: Create employee records with manager references
    for (const record of hierarchyRecords) {
        const employeeCode = parseInt(record.ID);
        const managerCode = parseInt(record.Identifier);

        // Check if manager exists in our dataset
        const managerUUID = employeeCodeToUUID[managerCode];

        if (!managerUUID) {
            console.log(`   ⚠️  Warning: Manager code ${managerCode} not found for employee ${employeeCode}`);
            console.log(`      This employee will be created without a manager (top-level)`);
        }

        employees.push({
            id: employeeCodeToUUID[employeeCode],
            employee_code: employeeCode,
            first_name: record.Nombre,
            last_name: record.Apellido,
            manager_id: managerUUID || null,
            // These will be filled from performance data
            rut: null,
            email: null
        });

        managerMap[employeeCode] = managerCode;
    }

    console.log(`✅ Processed ${employees.length} employees from hierarchy data`);

    return { employees, managerMap, employeeCodeToUUID };
}

/**
 * Process performance CSV and enrich employee data + create evaluations
 */
function processPerformanceData(performanceRecords, employees, employeeCodeToUUID) {
    console.log('\n📊 Processing performance data...');

    const evaluations = [];
    const comments = [];

    // Create a map for quick employee lookup
    const employeeMap = new Map();
    employees.forEach(emp => {
        employeeMap.set(emp.employee_code, emp);
    });

    for (const record of performanceRecords) {
        const employeeCode = parseInt(record.ID);
        const employee = employeeMap.get(employeeCode);

        if (!employee) {
            console.log(`   ⚠️  Warning: Employee ${employeeCode} found in performance data but not in hierarchy`);
            continue;
        }

        // Enrich employee data with info from performance CSV
        employee.rut = cleanString(record.Rut);
        employee.email = cleanString(record.Email);

        // Create performance evaluation record
        const evaluationId = uuidv4();
        const evaluation = {
            id: evaluationId,
            employee_id: employee.id,
            evaluation_year: CONFIG.evaluationYear,

            // General metrics
            general_potential: toDecimal(record['General - Potencial']),
            general_potential_label: cleanString(record['Etiqueta']),

            // Performance categories
            peer_client_score: toDecimal(record['Par/Cliente (Desempeño)']),
            peer_client_label: cleanString(record['Etiqueta']),

            direct_manager_score: toDecimal(record['Jefe Directo (Desempeño)']),
            direct_manager_label: cleanString(record['Etiqueta']),

            competencies_avg_score: toDecimal(record['Promedio de Competencias Desempeño']),
            competencies_avg_label: cleanString(record['Etiqueta']),

            // Individual competencies
            somos_un_solo_equipo_score: toDecimal(record['SOMOS UN SOLO EQUIPO']),
            somos_un_solo_equipo_label: cleanString(record['Etiqueta']),

            nos_movemos_agilmente_score: toDecimal(record['NOS MOVEMOS ÁGILMENTE']),
            nos_movemos_agilmente_label: cleanString(record['Etiqueta']),

            nos_apasionamos_por_cliente_score: toDecimal(record['NOS APASIONAMOS POR EL CLIENTE']),
            nos_apasionamos_por_cliente_label: cleanString(record['Etiqueta']),

            cuidamos_el_futuro_score: toDecimal(record['CUIDAMOS EL FUTURO']),
            cuidamos_el_futuro_label: cleanString(record['Etiqueta'])
        };

        evaluations.push(evaluation);

        // Note: If you have comment columns in your CSV, add them here
        // For now, we'll create placeholder comments
        // You can modify this section when you have actual comment data

        console.log(`   ✓ Processed evaluation for ${employee.first_name} ${employee.last_name}`);
    }

    console.log(`✅ Processed ${evaluations.length} performance evaluations`);

    return { evaluations, comments };
}

// ============================================================================
// DATABASE IMPORT FUNCTIONS
// ============================================================================

/**
 * Import employees to Supabase
 */
async function importEmployees(employees) {
    console.log('\n📤 Importing employees to Supabase...');

    // Validate all employees have required fields
    const invalidEmployees = employees.filter(emp => !emp.rut || !emp.email);
    if (invalidEmployees.length > 0) {
        console.error('❌ Error: Some employees are missing required fields (rut or email):');
        invalidEmployees.forEach(emp => {
            console.error(`   - Employee ${emp.employee_code}: ${emp.first_name} ${emp.last_name}`);
        });
        throw new Error('Data validation failed');
    }

    // Import in batches of 100
    const batchSize = 100;
    let imported = 0;

    for (let i = 0; i < employees.length; i += batchSize) {
        const batch = employees.slice(i, i + batchSize);

        const { data, error } = await supabase
            .from('employees')
            .upsert(batch, {
                onConflict: 'employee_code',
                ignoreDuplicates: false
            });

        if (error) {
            console.error(`❌ Error importing employee batch ${i / batchSize + 1}:`, error);
            throw error;
        }

        imported += batch.length;
        console.log(`   ✓ Imported ${imported}/${employees.length} employees`);
    }

    console.log(`✅ Successfully imported ${imported} employees`);
}

/**
 * Import performance evaluations to Supabase
 */
async function importEvaluations(evaluations) {
    console.log('\n📤 Importing performance evaluations to Supabase...');

    const batchSize = 100;
    let imported = 0;

    for (let i = 0; i < evaluations.length; i += batchSize) {
        const batch = evaluations.slice(i, i + batchSize);

        const { data, error } = await supabase
            .from('performance_evaluations')
            .upsert(batch, {
                onConflict: 'employee_id,evaluation_year',
                ignoreDuplicates: false
            });

        if (error) {
            console.error(`❌ Error importing evaluation batch ${i / batchSize + 1}:`, error);
            throw error;
        }

        imported += batch.length;
        console.log(`   ✓ Imported ${imported}/${evaluations.length} evaluations`);
    }

    console.log(`✅ Successfully imported ${imported} evaluations`);
}

/**
 * Import evaluation comments to Supabase
 */
async function importComments(comments) {
    if (comments.length === 0) {
        console.log('\n⏭️  No comments to import');
        return;
    }

    console.log('\n📤 Importing evaluation comments to Supabase...');

    const batchSize = 100;
    let imported = 0;

    for (let i = 0; i < comments.length; i += batchSize) {
        const batch = comments.slice(i, i + batchSize);

        const { data, error } = await supabase
            .from('evaluation_comments')
            .upsert(batch, {
                onConflict: 'evaluation_id,category',
                ignoreDuplicates: false
            });

        if (error) {
            console.error(`❌ Error importing comment batch ${i / batchSize + 1}:`, error);
            throw error;
        }

        imported += batch.length;
        console.log(`   ✓ Imported ${imported}/${comments.length} comments`);
    }

    console.log(`✅ Successfully imported ${imported} comments`);
}

// ============================================================================
// VERIFICATION FUNCTIONS
// ============================================================================

/**
 * Verify imported data
 */
async function verifyImport() {
    console.log('\n🔍 Verifying imported data...');

    // Count employees
    const { count: employeeCount, error: empError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true });

    if (empError) {
        console.error('❌ Error counting employees:', empError);
    } else {
        console.log(`   ✓ Total employees in database: ${employeeCount}`);
    }

    // Count evaluations
    const { count: evalCount, error: evalError } = await supabase
        .from('performance_evaluations')
        .select('*', { count: 'exact', head: true })
        .eq('evaluation_year', CONFIG.evaluationYear);

    if (evalError) {
        console.error('❌ Error counting evaluations:', evalError);
    } else {
        console.log(`   ✓ Total evaluations for ${CONFIG.evaluationYear}: ${evalCount}`);
    }

    // Get managers
    const { data: managers, error: mgrError } = await supabase
        .from('employees')
        .select('id, employee_code, first_name, last_name, email')
        .in('id',
            supabase
                .from('employees')
                .select('manager_id')
                .not('manager_id', 'is', null)
        );

    if (!mgrError && managers) {
        console.log(`   ✓ Unique managers: ${managers.length}`);
    }

    console.log('\n✅ Verification complete!');
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
    console.log('============================================================================');
    console.log('   EMPLOYEE PERFORMANCE DATA IMPORT');
    console.log('============================================================================');
    console.log(`   Evaluation Year: ${CONFIG.evaluationYear}`);
    console.log(`   Supabase URL: ${CONFIG.supabase.url}`);
    console.log('============================================================================');

    try {
        // Step 1: Read CSV files
        console.log('\n📖 Reading CSV files...');
        const hierarchyRecords = parseCSV(CONFIG.csvFiles.hierarchy);
        const performanceRecords = parseCSV(CONFIG.csvFiles.performance);
        console.log(`   ✓ Hierarchy records: ${hierarchyRecords.length}`);
        console.log(`   ✓ Performance records: ${performanceRecords.length}`);

        // Step 2: Process hierarchy data
        const { employees, managerMap, employeeCodeToUUID } = processHierarchyData(hierarchyRecords);

        // Step 3: Process performance data
        const { evaluations, comments } = processPerformanceData(
            performanceRecords,
            employees,
            employeeCodeToUUID
        );

        // Step 4: Import to Supabase
        await importEmployees(employees);
        await importEvaluations(evaluations);
        await importComments(comments);

        // Step 5: Verify import
        await verifyImport();

        console.log('\n============================================================================');
        console.log('   ✅ DATA IMPORT COMPLETED SUCCESSFULLY!');
        console.log('============================================================================');
        console.log('\n💡 Next Steps:');
        console.log('   1. Log into Supabase Dashboard');
        console.log('   2. Go to Table Editor and verify the data');
        console.log('   3. Test RLS policies by querying as different users');
        console.log('   4. Use the example queries from example_queries.sql');
        console.log('\n');

    } catch (error) {
        console.error('\n============================================================================');
        console.error('   ❌ DATA IMPORT FAILED');
        console.error('============================================================================');
        console.error('Error:', error.message);
        console.error('\nStack trace:', error.stack);
        process.exit(1);
    }
}

// Run the import
if (require.main === module) {
    main();
}

module.exports = { main, processHierarchyData, processPerformanceData };
