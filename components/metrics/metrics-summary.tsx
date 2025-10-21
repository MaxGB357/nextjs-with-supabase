/**
 * MetricsSummary Component
 * Displays summary statistics for user metrics
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MetricsSummary } from "@/lib/types/database.types";

interface MetricsSummaryProps {
  summary: MetricsSummary;
}

export function MetricsSummaryCard({ summary }: MetricsSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Total Count Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Total Metrics</CardTitle>
          <CardDescription>Number of tracked metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{summary.totalCount}</div>
        </CardContent>
      </Card>

      {/* Average Value Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Average Value</CardTitle>
          <CardDescription>Mean value across all metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{summary.averageValue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground mt-1">Scale: 1-5</p>
        </CardContent>
      </Card>

      {/* Category Breakdown Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Categories</CardTitle>
          <CardDescription>Unique categories tracked</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{summary.categories.length}</div>
          <div className="flex flex-wrap gap-1 mt-3">
            {summary.categories.slice(0, 3).map((category) => (
              <Badge key={category} variant="secondary" className="text-xs">
                {category}
              </Badge>
            ))}
            {summary.categories.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{summary.categories.length - 3} more
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
