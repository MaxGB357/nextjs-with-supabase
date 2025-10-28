"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { HistoricEvaluationData } from '@/lib/types/performance.types';

interface MetricEvolutionChartProps {
  historicData: HistoricEvaluationData;
  employeeName: string;
}

export function MetricEvolutionChart({ historicData, employeeName }: MetricEvolutionChartProps) {
  // Transform data for the chart
  const chartData = historicData.availableYears.map(year => {
    const evaluation = historicData.evaluationsByYear[year];

    return {
      year: year.toString(),
      potencialGeneral: evaluation?.general_potential ?? null,
      evaluacionJefe: evaluation?.direct_manager_score ?? null,
      evaluacionColaborador: evaluation?.colaborador_desempeño ?? null,
    };
  });

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-2">{`Año ${payload[0].payload.year}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${entry.value !== null ? entry.value.toFixed(2) : 'N/A'}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        Evolución de Métricas - {employeeName}
      </h3>

      <div className="border rounded-lg p-6 bg-card">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="year"
              label={{ value: 'Año', position: 'insideBottom', offset: -5 }}
              className="text-sm"
            />
            <YAxis
              label={{ value: 'Puntaje', angle: -90, position: 'insideLeft' }}
              className="text-sm"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="line"
            />

            {/* Potencial General - Blue */}
            <Line
              type="monotone"
              dataKey="potencialGeneral"
              name="Potencial General"
              stroke="#271DED"
              strokeWidth={2}
              dot={{ fill: "#271DED", r: 5 }}
              activeDot={{ r: 7 }}
              connectNulls={false}
            />

            {/* Evaluación Jefe - Green */}
            <Line
              type="monotone"
              dataKey="evaluacionJefe"
              name="Evaluación Jefe"
              stroke="#257916"
              strokeWidth={2}
              dot={{ fill: "#257916", r: 5 }}
              activeDot={{ r: 7 }}
              connectNulls={false}
            />

            {/* Evaluación Colaborador - Orange */}
            <Line
              type="monotone"
              dataKey="evaluacionColaborador"
              name="Evaluación Colaborador"
              stroke="#FF5D38"
              strokeWidth={2}
              dot={{ fill: "#FF5D38", r: 5 }}
              activeDot={{ r: 7 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
