/**
 * Sample Data Seeder for User Metrics
 *
 * This script seeds the database with sample metrics for demonstration
 * Run with: npx tsx scripts/seed-sample-data.ts <user-email>
 *
 * This is a development/demo utility. In production, use the regular import script.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database, UserMetricInsert } from '../lib/types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

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
  { metric_name: 'Mobile Performance', metric_value: 3, category: 'Performance', description: 'Mobile app performance metrics' },
  { metric_name: 'Accessibility Score', metric_value: 5, category: 'Quality', description: 'WCAG compliance score' },
  { metric_name: 'Database Query Time', metric_value: 4, category: 'Performance', description: 'Average database query performance' },
  { metric_name: 'CI/CD Pipeline Speed', metric_value: 3, category: 'DevOps', description: 'Build and deployment pipeline speed' },
  { metric_name: 'Customer Support Response', metric_value: 5, category: 'Customer', description: 'Average response time to customer inquiries' },
];

async function seedData(userEmail: string) {
  console.log('=== Seeding Sample Metrics ===\n');
  console.log(`Finding user: ${userEmail}`);

  // In a real scenario with service role key, you could query auth.users
  // For now, we'll need the user to be signed in
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('Error: Not authenticated');
    console.error('Please run the app first, sign in, and then run this script');
    process.exit(1);
  }

  if (user.email !== userEmail) {
    console.error(`Error: Signed in as ${user.email} but trying to seed for ${userEmail}`);
    console.error('Please ensure you are signed in with the correct account');
    process.exit(1);
  }

  console.log(`Seeding ${SAMPLE_METRICS.length} metrics for ${user.email}`);

  const metricsWithUserId: UserMetricInsert[] = SAMPLE_METRICS.map(metric => ({
    ...metric,
    user_id: user.id,
  }));

  const { data, error } = await supabase
    .from('user_metrics')
    .insert(metricsWithUserId as any)
    .select();

  if (error) {
    console.error('Error seeding data:', error.message);
    process.exit(1);
  }

  console.log(`Successfully seeded ${data?.length || 0} metrics`);
  console.log('\nSample data seeded! Visit /protected to view your metrics dashboard.');
}

const userEmail = process.argv[2];
if (!userEmail) {
  console.error('Usage: npx tsx scripts/seed-sample-data.ts <user-email>');
  process.exit(1);
}

seedData(userEmail).catch(console.error);
