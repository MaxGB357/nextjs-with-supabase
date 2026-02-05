"use client";

import { useState } from "react";
import {
  X,
  User,
  TrendingUp,
  Award,
  Eye,
  AlertTriangle,
  Users,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

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

interface EmployeeDetailPanelProps {
  employees: EmployeeData[];
  onClose: () => void;
  onRemove?: (index: number) => void;
  onViewDetail?: (employee: EmployeeData) => void;
}

function getScoreColor(score: number): string {
  if (score >= 3.3) return "bg-blue-600 text-white";
  if (score >= 3.0) return "bg-green-600 text-white";
  if (score >= 2.71) return "bg-yellow-500 text-black";
  return "bg-orange-500 text-white";
}

function CompactComparisonCard({
  employee,
  onRemove,
  onViewDetail,
}: {
  employee: EmployeeData;
  onRemove?: () => void;
  onViewDetail?: () => void;
}) {
  return (
    <Card className="relative overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
      {/* Remove button */}
      {onRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1 right-1 h-6 w-6 opacity-60 hover:opacity-100"
          onClick={onRemove}
        >
          <X className="h-3 w-3" />
        </Button>
      )}

      <CardContent className="p-3">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm truncate">{employee.name}</p>
            {employee.alerta && (
              <div className="flex items-center gap-1 text-orange-500">
                <AlertTriangle className="h-3 w-3" />
                <span className="text-xs truncate">{employee.alerta}</span>
              </div>
            )}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="text-center p-2 bg-muted/50 rounded">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <TrendingUp className="h-3 w-3" />
              <span className="text-xs">Potencial</span>
            </div>
            <Badge className={`${getScoreColor(employee.potencial)} border-0`}>
              {employee.potencial.toFixed(1)}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {employee.potencialLabel}
            </p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Award className="h-3 w-3" />
              <span className="text-xs">Competencias</span>
            </div>
            <Badge
              className={`${getScoreColor(employee.competencias)} border-0`}
            >
              {employee.competencias.toFixed(2)}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {employee.competenciasLabel}
            </p>
          </div>
        </div>

        {/* Jefe Directo */}
        {employee.jefeDirecto && (
          <div className="flex items-center justify-between text-xs mb-3 px-1">
            <span className="text-muted-foreground">Jefe Directo</span>
            <div className="flex items-center gap-1">
              <Badge
                className={`${getScoreColor(employee.jefeDirecto)} border-0 text-xs`}
              >
                {employee.jefeDirecto.toFixed(2)}
              </Badge>
            </div>
          </div>
        )}

        {/* Competencias mini list */}
        {employee.competenciasDetalle && (
          <div className="space-y-1 mb-3">
            {employee.competenciasDetalle.slice(0, 4).map((comp, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs"
              >
                <span className="truncate text-muted-foreground flex-1 mr-2">
                  {comp.name.split(" ").slice(0, 3).join(" ")}
                </span>
                <Badge
                  variant="outline"
                  className={`${getScoreColor(comp.score)} border-0 text-xs px-1.5 py-0`}
                >
                  {comp.score.toFixed(1)}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* Ver detalle button */}
        {onViewDetail && (
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={onViewDetail}
          >
            <Eye className="h-3 w-3 mr-1" />
            Ver detalle
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function EmployeeDetailPanel({
  employees,
  onClose,
  onRemove,
  onViewDetail,
}: EmployeeDetailPanelProps) {
  const [detailEmployee, setDetailEmployee] = useState<EmployeeData | null>(
    null,
  );

  if (employees.length === 0) return null;

  // Determine grid columns based on count
  const getGridClass = (count: number) => {
    switch (count) {
      case 1:
        return "grid-cols-1 max-w-xs mx-auto";
      case 2:
        return "grid-cols-2";
      case 3:
        return "grid-cols-3";
      default:
        return "grid-cols-2 lg:grid-cols-4";
    }
  };

  return (
    <>
      <div className="border-t bg-gradient-to-t from-muted/50 to-muted/20 p-4 animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              {employees.length === 1 ? (
                <User className="h-4 w-4 text-primary" />
              ) : (
                <Users className="h-4 w-4 text-primary" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-sm">
                {employees.length === 1 ? "Mesa de Trabajo" : "Comparación"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {employees.length === 1
                  ? employees[0].name
                  : `${employees.length} colaboradores seleccionados`}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Cards Grid */}
        <div className={`grid gap-3 ${getGridClass(employees.length)}`}>
          {employees.map((emp, index) => (
            <CompactComparisonCard
              key={`${emp.name}-${index}`}
              employee={emp}
              onRemove={() => onRemove?.(index)}
              onViewDetail={() => setDetailEmployee(emp)}
            />
          ))}
        </div>

        {employees.length === 1 && (
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Haz clic en otras cards del chat o sidebar para comparar
          </p>
        )}
      </div>

      {/* Full Detail Modal */}
      {detailEmployee && (
        <FullDetailModal
          employee={detailEmployee}
          onClose={() => setDetailEmployee(null)}
        />
      )}
    </>
  );
}

// Full detail modal similar to dashboard
function FullDetailModal({
  employee,
  onClose,
}: {
  employee: EmployeeData;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in-0 duration-200">
      <div className="bg-background rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <User className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{employee.name}</h2>
              {employee.alerta && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {employee.alerta}
                </Badge>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {/* Main Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">Potencial</span>
                </div>
                <Badge
                  className={`${getScoreColor(employee.potencial)} border-0 text-xl px-4 py-1`}
                >
                  {employee.potencial.toFixed(1)}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  {employee.potencialLabel}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-2">
                  <Award className="h-4 w-4" />
                  <span className="text-sm">Competencias</span>
                </div>
                <Badge
                  className={`${getScoreColor(employee.competencias)} border-0 text-xl px-4 py-1`}
                >
                  {employee.competencias.toFixed(2)}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  {employee.competenciasLabel}
                </p>
              </CardContent>
            </Card>

            {employee.jefeDirecto && (
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm">Jefe Directo</span>
                  </div>
                  <Badge
                    className={`${getScoreColor(employee.jefeDirecto)} border-0 text-xl px-4 py-1`}
                  >
                    {employee.jefeDirecto.toFixed(2)}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">
                    {employee.jefeDirectoLabel}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Competencias Detalle */}
          {employee.competenciasDetalle && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Desglose de Competencias</h3>
                <div className="space-y-3">
                  {employee.competenciasDetalle.map((comp, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">
                            {comp.name}
                          </span>
                          <Badge
                            className={`${getScoreColor(comp.score)} border-0`}
                          >
                            {comp.score.toFixed(1)}
                          </Badge>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getScoreColor(comp.score).split(" ")[0]}`}
                            style={{ width: `${(comp.score / 5) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {comp.label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background border-t p-4 flex justify-end">
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </div>
  );
}
