"use client";

import { useState } from "react";
import { Eye, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { EmployeeWithEvaluation } from "@/lib/types/performance.types";
import { getPerformanceColor } from "@/lib/types/performance.types";

interface TeamTableProps {
  teamMembers: EmployeeWithEvaluation[];
  onViewDetails: (employeeId: string) => void;
}

type SortField = 'code' | 'name' | 'potential' | 'competencies' | 'manager_score';
type SortDirection = 'asc' | 'desc';

export function TeamTable({ teamMembers, onViewDetails }: TeamTableProps) {
  const [sortField, setSortField] = useState<SortField>('code');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedMembers = [...teamMembers].sort((a, b) => {
    let aValue: number | string;
    let bValue: number | string;

    switch (sortField) {
      case 'code':
        aValue = a.employee.employee_code;
        bValue = b.employee.employee_code;
        break;
      case 'name':
        aValue = a.full_name;
        bValue = b.full_name;
        break;
      case 'potential':
        aValue = a.evaluation?.general_potential ?? -1;
        bValue = b.evaluation?.general_potential ?? -1;
        break;
      case 'competencies':
        aValue = a.evaluation?.competencies_avg_score ?? -1;
        bValue = b.evaluation?.competencies_avg_score ?? -1;
        break;
      case 'manager_score':
        aValue = a.evaluation?.direct_manager_score ?? -1;
        bValue = b.evaluation?.direct_manager_score ?? -1;
        break;
      default:
        aValue = 0;
        bValue = 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-primary transition-colors"
    >
      {label}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  if (teamMembers.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <p className="text-muted-foreground">No hay colaboradores directos para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left p-3 text-sm font-semibold">
                <SortButton field="code" label="Código" />
              </th>
              <th className="text-left p-3 text-sm font-semibold">
                <SortButton field="name" label="Nombre Completo" />
              </th>
              <th className="text-left p-3 text-sm font-semibold">
                <SortButton field="potential" label="Potencial General" />
              </th>
              <th className="text-left p-3 text-sm font-semibold">
                <SortButton field="competencies" label="Promedio Competencias" />
              </th>
              <th className="text-left p-3 text-sm font-semibold">
                <SortButton field="manager_score" label="Evaluación Jefe" />
              </th>
              <th className="text-center p-3 text-sm font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sortedMembers.map((member) => {
              const evaluation = member.evaluation;
              const potentialColor = getPerformanceColor(evaluation?.general_potential ?? null);
              const competenciesColor = getPerformanceColor(evaluation?.competencies_avg_score ?? null);
              const managerColor = getPerformanceColor(evaluation?.direct_manager_score ?? null);

              return (
                <tr key={member.employee.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-sm font-medium">{member.employee.employee_code}</td>
                  <td className="p-3">
                    <div>
                      <p className="font-medium">{member.full_name}</p>
                      <p className="text-sm text-muted-foreground">{member.employee.email}</p>
                    </div>
                  </td>
                  <td className="p-3">
                    {evaluation?.general_potential !== null ? (
                      <div className="flex items-center gap-2">
                        <Badge className={`${potentialColor.bgColor} ${potentialColor.textColor} border-0`}>
                          {evaluation.general_potential.toFixed(2)}
                        </Badge>
                        {evaluation.general_potential_label && (
                          <span className="text-xs text-muted-foreground">
                            {evaluation.general_potential_label}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Sin evaluación</span>
                    )}
                  </td>
                  <td className="p-3">
                    {evaluation?.competencies_avg_score !== null ? (
                      <div className="flex items-center gap-2">
                        <Badge className={`${competenciesColor.bgColor} ${competenciesColor.textColor} border-0`}>
                          {evaluation.competencies_avg_score.toFixed(2)}
                        </Badge>
                        {evaluation.competencies_avg_label && (
                          <span className="text-xs text-muted-foreground">
                            {evaluation.competencies_avg_label}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Sin evaluación</span>
                    )}
                  </td>
                  <td className="p-3">
                    {evaluation?.direct_manager_score !== null ? (
                      <div className="flex items-center gap-2">
                        <Badge className={`${managerColor.bgColor} ${managerColor.textColor} border-0`}>
                          {evaluation.direct_manager_score.toFixed(2)}
                        </Badge>
                        {evaluation.direct_manager_label && (
                          <span className="text-xs text-muted-foreground">
                            {evaluation.direct_manager_label}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Sin evaluación</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onViewDetails(member.employee.id)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Ver Detalles
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
