/**
 * Data Import Script for User Metrics
 *
 * This script imports user metrics from a CSV file or generates sample data
 * Run with: npx tsx scripts/import-metrics.ts [csv-file-path]
 *
 * CSV format:
 * metric_name,metric_value,category,description
 * Response Time,4,Performance,"API response time measurement"
 * Code Quality,5,Quality,"Code review score"
 *
 * Requirements:
 * - User must be authenticated (provide user ID via environment or login)
 * - CSV values must be 1-5
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import type { Database, UserMetricInsert } from '../lib/types/database.types';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are set');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

/**
 * Sample metrics data for demonstration
 */
const SAMPLE_METRICS = [
  { metric_name: 'API Response Time', metric_value: 4, category: 'Performance', description: 'Average API response time under 200ms' },
  { metric_name: 'Code Coverage', metric_value: 5, category: 'Quality', description: 'Test coverage above 85%' },
  { metric_name: 'Bug Resolution Time', metric_value: 3, category: 'Efficiency', description: 'Average time to resolve bugs' },
  { metric_name: 'User Satisfaction', metric_value: 5, category: 'Customer', description: 'NPS score from user surveys' },
  { metric_name: 'Deployment Frequency', metric_value: 4, category: 'DevOps', description: 'Deployments per week' },
  { metric_name: 'Security Compliance', metric_value: 5, category: 'Security', description: 'Security audit score' },
  { metric_name: 'Documentation Quality', metric_value: 4, category: 'Quality', description: 'Documentation completeness score' },
  { metric_name: 'Load Time', metric_value: 4, category: 'Performance', description: 'Page load time optimization' },
  { metric_name: 'Error Rate', metric_value: 2, category: 'Reliability', description: 'Production error rate' },
  { metric_name: 'Team Velocity', metric_value: 4, category: 'Efficiency', description: 'Sprint velocity trend' },
];

/**
 * Parse CSV file and return metrics array
 */
function parseCSV(filePath: string): Array<{
  metric_name: string;
  metric_value: number;
  category: string;
  description: string;
}> {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n').filter(line => line.trim());

  // Skip header row
  const dataLines = lines.slice(1);

  return dataLines.map(line => {
    const [metric_name, metric_value, category, description] = line.split(',').map(s => s.trim());
    const value = parseInt(metric_value, 10);

    if (isNaN(value) || value < 1 || value > 5) {
      throw new Error(`Invalid metric_value: ${metric_value}. Must be between 1 and 5.`);
    }

    return {
      metric_name,
      metric_value: value,
      category,
      description: description || '',
    };
  });
}

/**
 * Import metrics for authenticated user
 */
async function importMetrics(metrics: Array<{
  metric_name: string;
  metric_value: number;
  category: string;
  description: string;
}>) {
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('Error: Not authenticated');
    console.error('Please sign in first by running the app and creating an account');
    console.error('Then get your access token from the developer tools (localStorage)');
    process.exit(1);
  }

  console.log(`Importing ${metrics.length} metrics for user: ${user.email}`);

  // Prepare data with user_id
  const metricsWithUserId: UserMetricInsert[] = metrics.map(metric => ({
    ...metric,
    user_id: user.id,
  }));

  // Insert metrics
  const { data, error } = await supabase
    .from('user_metrics')
    .insert(metricsWithUserId as any)
    .select();

  if (error) {
    console.error('Error importing metrics:', error.message);
    process.exit(1);
  }

  console.log(`Successfully imported ${data?.length || 0} metrics`);
  return data;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);

  console.log('=== User Metrics Import Tool ===\n');

  let metrics;

  if (args.length > 0) {
    // Import from CSV file
    const csvPath = path.resolve(args[0]);

    if (!fs.existsSync(csvPath)) {
      console.error(`Error: File not found: ${csvPath}`);
      process.exit(1);
    }

    console.log(`Reading metrics from: ${csvPath}`);
    try {
      metrics = parseCSV(csvPath);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      process.exit(1);
    }
  } else {
    // Use sample data
    console.log('No CSV file provided, using sample data');
    metrics = SAMPLE_METRICS;
  }

  await importMetrics(metrics);

  console.log('\nImport complete! Visit /protected to view your metrics dashboard.');
}

// Run the script
main().catch(console.error);
