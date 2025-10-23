"use client";

import { useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { MetricRow } from "@/lib/types/performance.types";
import { getPerformanceColor } from "@/lib/types/performance.types";

interface HistoricTableProps {
  metrics: MetricRow[];
  availableYears: number[];
  employeeName: string;
}

type SortColumn = number | "average" | null; // year number, "average", or null for unsorted
type SortDirection = "asc" | "desc" | null;

export function HistoricTable({ metrics, availableYears, employeeName }: HistoricTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (column: number | "average") => {
    if (sortColumn === column) {
      // Cycle through: asc -> desc -> unsorted
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const SortButton = ({ column, label }: { column: number | "average"; label: string }) => {
    const isActive = sortColumn === column;
    return (
      <button
        onClick={() => handleSort(column)}
        className={`flex items-center justify-center gap-1 hover:text-primary transition-colors ${
          isActive ? "font-bold" : ""
        }`}
      >
        {label}
        <ArrowUpDown className="h-3 w-3" />
      </button>
    );
  };

  // Sort metrics based on current sort column and direction
  const sortedMetrics = [...metrics].sort((a, b) => {
    if (sortColumn === null || sortDirection === null) {
      return 0; // Maintain original order when unsorted
    }

    let aValue: number | null;
    let bValue: number | null;

    if (sortColumn === "average") {
      aValue = a.average;
      bValue = b.average;
    } else {
      // sortColumn is a year number
      aValue = a.yearData[sortColumn]?.score ?? null;
      bValue = b.yearData[sortColumn]?.score ?? null;
    }

    // Treat null as lowest (always at bottom)
    if (aValue === null && bValue === null) return 0;
    if (aValue === null) return 1; // a goes to bottom
    if (bValue === null) return -1; // b goes to bottom

    // Sort by score value
    if (sortDirection === "asc") {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });

  if (metrics.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <p className="text-muted-foreground">No hay datos de evaluación para este colaborador.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        Historial de Evaluaciones - {employeeName}
      </h3>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left p-3 text-sm font-semibold sticky left-0 bg-muted/50 z-10">
                  Métrica
                </th>
                {availableYears.map((year) => (
                  <th key={year} className="text-center p-3 text-sm min-w-[120px]">
                    <SortButton column={year} label={year.toString()} />
                  </th>
                ))}
                <th className="text-center p-3 text-sm min-w-[120px] bg-primary/5">
                  <SortButton column="average" label="Promedio" />
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedMetrics.map((metric, index) => {
                const averageColor = getPerformanceColor(metric.average);

                return (
                  <tr key={index} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3 text-sm font-medium sticky left-0 bg-background">
                      {metric.metricName}
                    </td>
                    {availableYears.map((year) => {
                      const yearData = metric.yearData[year];
                      const score = yearData?.score ?? null;
                      const label = yearData?.label ?? null;
                      const color = getPerformanceColor(score);

                      return (
                        <td key={year} className="p-3 text-center">
                          {score !== null ? (
                            <div className="flex flex-col items-center gap-1">
                              <Badge className={`${color.bgColor} ${color.textColor} border-0`}>
                                {Number.isInteger(score) ? score : score.toFixed(2)}
                              </Badge>
                              {label && (
                                <span className="text-xs text-muted-foreground">
                                  {label}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">N/A</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="p-3 text-center bg-primary/5">
                      {metric.average !== null ? (
                        <Badge className={`${averageColor.bgColor} ${averageColor.textColor} border-0 font-semibold`}>
                          {metric.average.toFixed(2)}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">N/A</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
