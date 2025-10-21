/**
 * Metrics Dashboard Page
 * Protected route that displays user metrics with summary statistics
 * Data is automatically filtered by RLS policies to show only authenticated user's metrics
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InfoIcon, TrendingUp } from "lucide-react";
import { MetricsSummaryCard } from "@/components/metrics/metrics-summary";
import { MetricsTable } from "@/components/metrics/metrics-table";
import { CategoryBreakdown } from "@/components/metrics/category-breakdown";
import { getUserMetrics, calculateMetricsSummary, getCategoryStats } from "@/lib/services/metrics.service";

export default async function ProtectedPage() {
  const supabase = await createClient();

  // Check authentication
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  // Fetch user metrics (automatically filtered by RLS)
  let metrics: Awaited<ReturnType<typeof getUserMetrics>> = [];
  try {
    metrics = await getUserMetrics();
  } catch (err) {
    console.error("Error loading metrics:", err);
    metrics = [];
  }

  // Calculate summary statistics
  const summary = calculateMetricsSummary(metrics);
  const categoryStats = getCategoryStats(metrics);

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      {/* Header */}
      <div className="w-full">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Metrics Dashboard</h1>
        </div>
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          This dashboard displays your personal metrics. All data is secured with Row Level Security and automatically filtered to show only your metrics.
        </div>
      </div>

      {/* Summary Statistics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Summary Statistics</h2>
        <MetricsSummaryCard summary={summary} />
      </div>

      {/* Category Breakdown */}
      {categoryStats.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Category Distribution</h2>
          <CategoryBreakdown categoryStats={categoryStats} />
        </div>
      )}

      {/* Metrics Table */}
      <div>
        <h2 className="text-xl font-semibold mb-4">All Metrics</h2>
        <MetricsTable metrics={metrics} />
      </div>

      {/* User Info (collapsed) */}
      <details className="mt-4">
        <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
          View user details
        </summary>
        <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto mt-2 bg-muted">
          {JSON.stringify(data.claims, null, 2)}
        </pre>
      </details>
    </div>
  );
}

export const dynamic = "force-dynamic";
