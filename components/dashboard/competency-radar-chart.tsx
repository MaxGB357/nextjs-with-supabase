"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import type { CompetencyData } from "@/lib/types/performance.types";

interface CompetencyRadarChartProps {
  competencies: CompetencyData[];
}

export function CompetencyRadarChart({ competencies }: CompetencyRadarChartProps) {
  // Transform data for recharts
  const chartData = competencies.map(comp => ({
    competency: comp.name,
    score: comp.score,
    fullMark: 5 // Max score is 5
  }));

  if (competencies.length === 0 || competencies.every(c => c.score === 0)) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        <p>No hay datos de competencias disponibles</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={chartData}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis
          dataKey="competency"
          tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 5]}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
        />
        <Radar
          name="Competencias"
          dataKey="score"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.6}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
