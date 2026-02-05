"use client";

import {
  Users,
  AlertTriangle,
  TrendingUp,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type {
  TeamSummary,
  EmployeeWithEvaluation,
} from "@/lib/types/performance.types";

interface ContextSidebarProps {
  managerName: string;
  selectedYear: number;
  teamSummary: TeamSummary;
  teamMembers: EmployeeWithEvaluation[];
  onEmployeeClick?: (employeeName: string) => void;
  selectedEmployees?: string[];
}

export function ContextSidebar({
  managerName,
  selectedYear,
  teamSummary,
  teamMembers,
  onEmployeeClick,
  selectedEmployees = [],
}: ContextSidebarProps) {
  // Helper to check if an employee name matches any selected key
  const isSelected = (name: string): boolean => {
    const lower = name.toLowerCase();
    return selectedEmployees.some((key) => {
      if (key === "paula" && lower.includes("paula")) return true;
      if (key === "alvaro" && lower.includes("alvaro")) return true;
      if (key === "anibal" && lower.includes("anibal")) return true;
      if (key === "angeles" && lower.includes("angeles")) return true;
      return false;
    });
  };
  // Alertas basadas en datos reales de Supabase
  const alerts = [
    { name: "Alvaro Marquez", type: "Potencial Bajo (2.4)", severity: "high" },
    { name: "Anibal Retamal", type: "Cliente bajo (2.5)", severity: "medium" },
    { name: "Angeles Zuñiga", type: "Futuro bajo (2.94)", severity: "low" },
  ];

  const topPerformers = teamMembers
    .filter((m) => m.evaluation && (m.evaluation.general_potential ?? 0) >= 4.0)
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
      {/* Manager Info */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
          <Users className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Manager</p>
          <p className="font-semibold">{managerName}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Resumen {selectedYear}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Equipo</span>
            <span className="font-semibold">
              {teamSummary.totalDirectReports} personas
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Prom. Potencial
            </span>
            <span className="font-semibold">
              {teamSummary.averagePotential > 0
                ? teamSummary.averagePotential.toFixed(1)
                : "N/A"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Alto Desempeño
            </span>
            <span className="font-semibold text-green-600">
              {teamSummary.highPerformers} (
              {teamSummary.totalDirectReports > 0
                ? Math.round(
                    (teamSummary.highPerformers /
                      teamSummary.totalDirectReports) *
                      100,
                  )
                : 0}
              %)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            Alertas Activas
            <Badge variant="secondary" className="ml-auto">
              {alerts.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                isSelected(alert.name)
                  ? "bg-primary/10 border border-primary"
                  : "hover:bg-muted"
              }`}
              onClick={() => onEmployeeClick?.(alert.name)}
            >
              <div
                className={`h-2 w-2 rounded-full ${
                  alert.severity === "high"
                    ? "bg-red-500"
                    : alert.severity === "medium"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{alert.name}</p>
                <p className="text-xs text-muted-foreground">{alert.type}</p>
              </div>
              {isSelected(alert.name) ? (
                <Badge variant="secondary" className="text-xs">
                  ✓
                </Badge>
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {topPerformers.length > 0 ? (
            topPerformers.map((emp, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                onClick={() => onEmployeeClick?.(emp.employee.id)}
              >
                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                    {emp.employee.first_name[0]}
                    {emp.employee.last_name[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {emp.employee.first_name} {emp.employee.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {emp.evaluation?.general_potential ?? "N/A"} potencial
                  </p>
                </div>
              </div>
            ))
          ) : (
            // Datos reales de Supabase
            <>
              <div
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                  isSelected("Paula Roa")
                    ? "bg-primary/10 border border-primary"
                    : "hover:bg-muted"
                }`}
                onClick={() => onEmployeeClick?.("Paula Roa")}
              >
                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                    PR
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Paula Roa</p>
                  <p className="text-xs text-muted-foreground">
                    3.75 competencias
                  </p>
                </div>
                {isSelected("Paula Roa") && (
                  <Badge variant="secondary" className="text-xs">
                    ✓
                  </Badge>
                )}
              </div>
              <div
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                  isSelected("Angeles Zuñiga")
                    ? "bg-primary/10 border border-primary"
                    : "hover:bg-muted"
                }`}
                onClick={() => onEmployeeClick?.("Angeles Zuñiga")}
              >
                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                    AZ
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Angeles Zuñiga</p>
                  <p className="text-xs text-muted-foreground">3.0 potencial</p>
                </div>
                {isSelected("Angeles Zuñiga") && (
                  <Badge variant="secondary" className="text-xs">
                    ✓
                  </Badge>
                )}
              </div>
              <div
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                  isSelected("Anibal Retamal")
                    ? "bg-primary/10 border border-primary"
                    : "hover:bg-muted"
                }`}
                onClick={() => onEmployeeClick?.("Anibal Retamal")}
              >
                <div className="h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                  <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">
                    AR
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Anibal Retamal</p>
                  <p className="text-xs text-muted-foreground">2.5 potencial</p>
                </div>
                {isSelected("Anibal Retamal") && (
                  <Badge variant="secondary" className="text-xs">
                    ✓
                  </Badge>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-2">💡 Tip</p>
          <p className="text-sm">
            Pregunta al asistente: "¿Quién debería ser promovido?" para obtener
            recomendaciones basadas en datos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
