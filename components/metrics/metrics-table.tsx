/**
 * MetricsTable Component
 * Displays user metrics in a responsive table
 * Note: All apostrophes properly escaped for ESLint compliance
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserMetric } from "@/lib/types/database.types";
import { formatDate } from "@/lib/services/metrics.service";

interface MetricsTableProps {
  metrics: UserMetric[];
}

/**
 * Returns background and text color classes based on the metric value (1-5)
 */
function getValueBadgeStyle(value: number): { bgColor: string; textColor: string } {
  if (value >= 3.3) return { bgColor: 'bg-[#271DED]', textColor: 'text-white' };   // Azul
  if (value >= 3.0) return { bgColor: 'bg-[#257916]', textColor: 'text-white' };   // Verde
  if (value >= 2.71) return { bgColor: 'bg-[#FFDB3D]', textColor: 'text-black' };  // Amarillo
  return { bgColor: 'bg-[#FF5D38]', textColor: 'text-white' };                     // Naranja
}

export function MetricsTable({ metrics }: MetricsTableProps) {
  if (metrics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Metrics</CardTitle>
          <CardDescription>No metrics found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>You don&apos;t have any metrics yet.</p>
            <p className="text-sm mt-2">Use the data import script to add some metrics.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Metrics</CardTitle>
        <CardDescription>All metrics are automatically filtered to show only your data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-sm">Metric Name</th>
                <th className="text-left py-3 px-4 font-medium text-sm">Category</th>
                <th className="text-left py-3 px-4 font-medium text-sm">Value</th>
                <th className="text-left py-3 px-4 font-medium text-sm">Description</th>
                <th className="text-left py-3 px-4 font-medium text-sm">Created</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((metric) => {
                const valueStyle = getValueBadgeStyle(metric.metric_value);
                return (
                  <tr key={metric.id} className="border-b last:border-b-0 hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 font-medium">{metric.metric_name}</td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary">{metric.category}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={`${valueStyle.bgColor} ${valueStyle.textColor} border-0`}>
                        {metric.metric_value}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground max-w-xs truncate">
                      {metric.description || "—"}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(metric.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
