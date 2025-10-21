/**
 * CategoryBreakdown Component
 * Displays detailed category statistics
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CategoryStats } from "@/lib/types/database.types";

interface CategoryBreakdownProps {
  categoryStats: CategoryStats[];
}

export function CategoryBreakdown({ categoryStats }: CategoryBreakdownProps) {
  if (categoryStats.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
        <CardDescription>Distribution of metrics across categories</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {categoryStats.map((stat) => (
            <div key={stat.category} className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Badge variant="secondary" className="min-w-[100px] justify-center">
                  {stat.category}
                </Badge>
                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all"
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <span className="text-sm font-medium">{stat.count}</span>
                <span className="text-xs text-muted-foreground">({stat.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
