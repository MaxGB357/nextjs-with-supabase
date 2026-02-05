"use client";

import { User, TrendingUp, Award, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EmployeeData {
  name: string;
  potencial: number;
  potencialLabel: string;
  competencias: number;
  competenciasLabel: string;
  jefeDirecto?: number;
  jefeDirectoLabel?: string;
  competenciasDetalle?: {
    name: string;
    score: number;
    label: string;
  }[];
  alerta?: string;
}

interface EmployeeCardProps {
  employee: EmployeeData;
  compact?: boolean;
  onClick?: () => void;
  isSelected?: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 3.3) return "bg-blue-600 text-white";
  if (score >= 3.0) return "bg-green-600 text-white";
  if (score >= 2.71) return "bg-yellow-500 text-black";
  return "bg-orange-500 text-white";
}

export function EmployeeCard({
  employee,
  compact = false,
  onClick,
  isSelected,
}: EmployeeCardProps) {
  return (
    <Card
      className={`w-full max-w-md border-2 transition-all duration-200 ${
        onClick
          ? "cursor-pointer hover:border-primary hover:shadow-lg hover:scale-[1.02]"
          : ""
      } ${isSelected ? "border-primary ring-2 ring-primary/20 shadow-lg shadow-primary/10" : ""}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <User className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-lg font-semibold">{employee.name}</p>
            {employee.alerta && (
              <div className="flex items-center gap-1 text-orange-500">
                <AlertTriangle className="h-3 w-3" />
                <span className="text-xs">{employee.alerta}</span>
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span className="text-xs">Potencial</span>
            </div>
            <Badge
              className={`${getScoreColor(employee.potencial)} border-0 text-lg px-3 py-1`}
            >
              {employee.potencial.toFixed(1)}
            </Badge>
            <p className="text-xs text-muted-foreground">
              {employee.potencialLabel}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Award className="h-3 w-3" />
              <span className="text-xs">Competencias</span>
            </div>
            <Badge
              className={`${getScoreColor(employee.competencias)} border-0 text-lg px-3 py-1`}
            >
              {employee.competencias.toFixed(2)}
            </Badge>
            <p className="text-xs text-muted-foreground">
              {employee.competenciasLabel}
            </p>
          </div>
        </div>

        {/* Jefe Directo */}
        {employee.jefeDirecto && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Eval. Jefe Directo
              </span>
              <div className="flex items-center gap-2">
                <Badge
                  className={`${getScoreColor(employee.jefeDirecto)} border-0`}
                >
                  {employee.jefeDirecto.toFixed(2)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {employee.jefeDirectoLabel}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Competencias Detalle */}
        {!compact && employee.competenciasDetalle && (
          <div className="pt-2 border-t space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Competencias
            </p>
            {employee.competenciasDetalle.map((comp, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm"
              >
                <span className="truncate flex-1">{comp.name}</span>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`${getScoreColor(comp.score)} border-0 text-xs`}
                  >
                    {comp.score.toFixed(1)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ComparisonCardProps {
  employees: EmployeeData[];
}

export function ComparisonCard({ employees }: ComparisonCardProps) {
  if (employees.length < 2) return null;

  const metrics = [
    { label: "Potencial", key: "potencial" as const, icon: "📊" },
    { label: "Competencias", key: "competencias" as const, icon: "🎯" },
    { label: "Jefe Directo", key: "jefeDirecto" as const, icon: "👔" },
  ];

  // Find best value for each metric
  const findBest = (key: "potencial" | "competencias" | "jefeDirecto") => {
    const values = employees.map((e) => e[key] ?? 0);
    const max = Math.max(...values);
    return employees.map((e) => (e[key] ?? 0) === max && max > 0);
  };

  const colCount = employees.length + 1;
  const gridCols =
    colCount === 3
      ? "grid-cols-3"
      : colCount === 4
        ? "grid-cols-4"
        : "grid-cols-5";

  return (
    <Card className="w-full border-2 overflow-hidden">
      <CardHeader className="pb-2 bg-muted/50">
        <CardTitle className="text-center text-base">
          📊 Comparación de {employees.length} colaboradores
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Header row with names */}
        <div className={`grid ${gridCols} border-b bg-muted/30`}>
          <div className="p-3 text-xs font-medium text-muted-foreground">
            Métrica
          </div>
          {employees.map((emp, i) => (
            <div key={i} className="p-3 text-center border-l">
              <p className="font-semibold text-sm">{emp.name.split(" ")[0]}</p>
              <p className="text-xs text-muted-foreground">
                {emp.name.split(" ")[1]}
              </p>
            </div>
          ))}
        </div>

        {/* Metric rows */}
        {metrics.map((metric) => {
          const bestIndexes = findBest(metric.key);
          return (
            <div
              key={metric.key}
              className={`grid ${gridCols} border-b last:border-b-0`}
            >
              <div className="p-3 text-xs text-muted-foreground flex items-center gap-1">
                <span>{metric.icon}</span>
                <span>{metric.label}</span>
              </div>
              {employees.map((emp, i) => {
                const val = emp[metric.key];
                if (val === undefined) {
                  return (
                    <div
                      key={i}
                      className="p-3 text-center border-l text-muted-foreground"
                    >
                      -
                    </div>
                  );
                }
                return (
                  <div key={i} className="p-3 text-center border-l">
                    <Badge
                      className={`${getScoreColor(val)} border-0 ${
                        bestIndexes[i]
                          ? "ring-2 ring-green-400 ring-offset-1"
                          : ""
                      }`}
                    >
                      {val.toFixed(2)}
                    </Badge>
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Alerts row */}
        <div className={`grid ${gridCols} bg-orange-50 dark:bg-orange-950/20`}>
          <div className="p-3 text-xs text-muted-foreground flex items-center gap-1">
            <span>⚠️</span>
            <span>Alertas</span>
          </div>
          {employees.map((emp, i) => (
            <div key={i} className="p-3 text-center border-l">
              {emp.alerta ? (
                <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                  {emp.alerta}
                </span>
              ) : (
                <span className="text-xs text-green-600">✓ OK</span>
              )}
            </div>
          ))}
        </div>

        {/* Labels row */}
        <div className={`grid ${gridCols} bg-muted/30 border-t`}>
          <div className="p-3 text-xs text-muted-foreground">Etiqueta</div>
          {employees.map((emp, i) => (
            <div key={i} className="p-3 text-center border-l">
              <span className="text-xs">{emp.potencialLabel}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Mock data for the prototype
export const EMPLOYEES_DATA: Record<string, EmployeeData> = {
  paula: {
    name: "Paula Roa",
    potencial: 2.5,
    potencialLabel: "Medio (Calibrado)",
    competencias: 3.75,
    competenciasLabel: "Sobresaliente",
    jefeDirecto: 3.75,
    jefeDirectoLabel: "Sobresaliente",
    competenciasDetalle: [
      { name: "Somos un solo equipo", score: 4.0, label: "Sobresaliente" },
      { name: "Nos movemos ágilmente", score: 3.5, label: "Sobresaliente" },
      {
        name: "Nos apasionamos por cliente",
        score: 3.5,
        label: "Sobresaliente",
      },
      { name: "Cuidamos el futuro", score: 4.0, label: "Sobresaliente" },
    ],
  },
  alvaro: {
    name: "Alvaro Marquez",
    potencial: 2.4,
    potencialLabel: "Bajo (Calibrado)",
    competencias: 3.38,
    competenciasLabel: "Sobresaliente",
    jefeDirecto: 3.13,
    jefeDirectoLabel: "Cumple Satisfactorio",
    alerta: "Potencial Bajo",
    competenciasDetalle: [
      { name: "Somos un solo equipo", score: 3.33, label: "Sobresaliente" },
      { name: "Nos movemos ágilmente", score: 3.33, label: "Sobresaliente" },
      {
        name: "Nos apasionamos por cliente",
        score: 3.5,
        label: "Sobresaliente",
      },
      { name: "Cuidamos el futuro", score: 3.33, label: "Sobresaliente" },
    ],
  },
  anibal: {
    name: "Anibal Retamal",
    potencial: 2.5,
    potencialLabel: "Medio (Calibrado)",
    competencias: 2.88,
    competenciasLabel: "Cumple Parcial",
    jefeDirecto: 2.88,
    jefeDirectoLabel: "Cumple Parcial",
    alerta: "Cliente bajo (2.5)",
    competenciasDetalle: [
      {
        name: "Somos un solo equipo",
        score: 3.0,
        label: "Cumple Satisfactorio",
      },
      {
        name: "Nos movemos ágilmente",
        score: 3.0,
        label: "Cumple Satisfactorio",
      },
      {
        name: "Nos apasionamos por cliente",
        score: 2.5,
        label: "Bajo lo esperado",
      },
      { name: "Cuidamos el futuro", score: 3.0, label: "Cumple Satisfactorio" },
    ],
  },
  angeles: {
    name: "Angeles Zuñiga",
    potencial: 3.0,
    potencialLabel: "Medio +",
    competencias: 3.14,
    competenciasLabel: "Cumple Satisfactorio",
    jefeDirecto: 3.38,
    jefeDirectoLabel: "Sobresaliente",
    competenciasDetalle: [
      {
        name: "Somos un solo equipo",
        score: 3.25,
        label: "Cumple Satisfactorio",
      },
      {
        name: "Nos movemos ágilmente",
        score: 3.19,
        label: "Cumple Satisfactorio",
      },
      {
        name: "Nos apasionamos por cliente",
        score: 3.19,
        label: "Cumple Satisfactorio",
      },
      { name: "Cuidamos el futuro", score: 2.94, label: "Cumple Parcial" },
    ],
  },
};
