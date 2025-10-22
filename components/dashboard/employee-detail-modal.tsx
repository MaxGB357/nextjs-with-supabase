"use client";

import { X, User, Mail, Hash, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompetencyRadarChart } from "./competency-radar-chart";
import type { EmployeeDetail } from "@/lib/types/performance.types";
import { getPerformanceColor } from "@/lib/types/performance.types";

interface EmployeeDetailModalProps {
  employeeDetail: EmployeeDetail | null;
  onClose: () => void;
  isOpen: boolean;
}

export function EmployeeDetailModal({ employeeDetail, onClose, isOpen }: EmployeeDetailModalProps) {
  if (!isOpen || !employeeDetail) return null;

  const { employee, evaluation, comments, competencies, full_name } = employeeDetail;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{full_name}</h2>
            <p className="text-sm text-muted-foreground">Detalles de Evaluación de Desempeño</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Employee Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Información del Colaborador
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Código</p>
                  <p className="font-medium">{employee.employee_code}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{employee.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">RUT</p>
                  <p className="font-medium">{employee.rut}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          {evaluation ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Métricas de Desempeño
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    {/* General Potential */}
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Potencial General</p>
                      {evaluation.general_potential !== null && (
                        <>
                          <Badge className={`${getPerformanceColor(evaluation.general_potential).bgColor} ${getPerformanceColor(evaluation.general_potential).textColor} border-0 text-lg px-3 py-1`}>
                            {evaluation.general_potential.toFixed(2)}
                          </Badge>
                          {evaluation.general_potential_label && (
                            <p className="text-xs text-muted-foreground">{evaluation.general_potential_label}</p>
                          )}
                        </>
                      )}
                    </div>

                    {/* Competencies Average */}
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Promedio Competencias</p>
                      {evaluation.competencies_avg_score !== null && (
                        <>
                          <Badge className={`${getPerformanceColor(evaluation.competencies_avg_score).bgColor} ${getPerformanceColor(evaluation.competencies_avg_score).textColor} border-0 text-lg px-3 py-1`}>
                            {evaluation.competencies_avg_score.toFixed(2)}
                          </Badge>
                          {evaluation.competencies_avg_label && (
                            <p className="text-xs text-muted-foreground">{evaluation.competencies_avg_label}</p>
                          )}
                        </>
                      )}
                    </div>

                    {/* Direct Manager Score */}
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Evaluación Jefe Directo</p>
                      {evaluation.direct_manager_score !== null && (
                        <>
                          <Badge className={`${getPerformanceColor(evaluation.direct_manager_score).bgColor} ${getPerformanceColor(evaluation.direct_manager_score).textColor} border-0 text-lg px-3 py-1`}>
                            {evaluation.direct_manager_score.toFixed(2)}
                          </Badge>
                          {evaluation.direct_manager_label && (
                            <p className="text-xs text-muted-foreground">{evaluation.direct_manager_label}</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Peer/Client Score */}
                  {evaluation.peer_client_score !== null && (
                    <div className="space-y-2 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">Evaluación Pares/Clientes</p>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getPerformanceColor(evaluation.peer_client_score).bgColor} ${getPerformanceColor(evaluation.peer_client_score).textColor} border-0`}>
                          {evaluation.peer_client_score.toFixed(2)}
                        </Badge>
                        {evaluation.peer_client_label && (
                          <span className="text-sm text-muted-foreground">{evaluation.peer_client_label}</span>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Competencies Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Desglose de Competencias</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {competencies.map((comp, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{comp.name}</p>
                            <Badge className={`${getPerformanceColor(comp.score).bgColor} ${getPerformanceColor(comp.score).textColor} border-0`}>
                              {comp.score.toFixed(2)}
                            </Badge>
                          </div>
                          {comp.label && (
                            <p className="text-xs text-muted-foreground">{comp.label}</p>
                          )}
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-4">Visualización Radar</p>
                      <CompetencyRadarChart competencies={competencies} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Comments */}
              {comments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Comentarios de Evaluación</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="border-l-2 border-primary pl-4">
                        <p className="text-sm font-medium text-primary mb-1">{comment.category}</p>
                        <p className="text-sm text-muted-foreground">{comment.comment_text || 'Sin comentarios'}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">
                  No hay datos de evaluación disponibles para este colaborador.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background border-t p-6 flex justify-end">
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </div>
  );
}
