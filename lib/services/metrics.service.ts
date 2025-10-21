/**
 * Metrics Service
 * Handles fetching and processing user metrics from Supabase
 */

import { createClient } from "@/lib/supabase/server";
import type { UserMetric, MetricsSummary, CategoryStats } from "@/lib/types/database.types";

/**
 * Fetches all metrics for the authenticated user
 * Data is automatically filtered by RLS policies
 */
export async function getUserMetrics(): Promise<UserMetric[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_metrics")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user metrics:", error);
    throw new Error(`Failed to fetch metrics: ${error.message}`);
  }

  return data || [];
}

/**
 * Calculates summary statistics from user metrics
 * Including total count, average value, and category breakdown
 */
export function calculateMetricsSummary(metrics: UserMetric[]): MetricsSummary {
  if (metrics.length === 0) {
    return {
      totalCount: 0,
      averageValue: 0,
      categoryBreakdown: {},
      categories: [],
    };
  }

  // Calculate total count and average value
  const totalCount = metrics.length;
  const sumOfValues = metrics.reduce((sum, metric) => sum + metric.metric_value, 0);
  const averageValue = sumOfValues / totalCount;

  // Calculate category breakdown
  const categoryBreakdown: Record<string, number> = {};
  metrics.forEach((metric) => {
    categoryBreakdown[metric.category] = (categoryBreakdown[metric.category] || 0) + 1;
  });

  const categories = Object.keys(categoryBreakdown).sort();

  return {
    totalCount,
    averageValue: Math.round(averageValue * 100) / 100, // Round to 2 decimal places
    categoryBreakdown,
    categories,
  };
}

/**
 * Calculates detailed category statistics with percentages
 */
export function getCategoryStats(metrics: UserMetric[]): CategoryStats[] {
  if (metrics.length === 0) {
    return [];
  }

  const categoryBreakdown: Record<string, number> = {};
  metrics.forEach((metric) => {
    categoryBreakdown[metric.category] = (categoryBreakdown[metric.category] || 0) + 1;
  });

  const totalCount = metrics.length;

  return Object.entries(categoryBreakdown)
    .map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / totalCount) * 100 * 100) / 100, // Round to 2 decimal places
    }))
    .sort((a, b) => b.count - a.count); // Sort by count descending
}

/**
 * Formats a date string to a more readable format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
