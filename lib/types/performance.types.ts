/**
 * TypeScript types for Performance Evaluation System
 * Based on schema.sql
 */

// Employee type
export interface Employee {
  id: string;
  employee_code: number;
  rut: string;
  first_name: string;
  last_name: string;
  email: string;
  manager_id: string | null;
  created_at: string;
  updated_at: string;
}

// Performance Evaluation type
export interface PerformanceEvaluation {
  id: string;
  employee_id: string;
  evaluation_year: number;

  // General metrics
  general_potential: number | null;
  general_potential_label: string | null;

  // Performance categories
  peer_client_score: number | null;
  peer_client_label: string | null;
  direct_manager_score: number | null;
  direct_manager_label: string | null;
  competencies_avg_score: number | null;
  competencies_avg_label: string | null;

  // Individual competencies
  somos_un_solo_equipo_score: number | null;
  somos_un_solo_equipo_label: string | null;
  nos_movemos_agilmente_score: number | null;
  nos_movemos_agilmente_label: string | null;
  nos_apasionamos_por_cliente_score: number | null;
  nos_apasionamos_por_cliente_label: string | null;
  cuidamos_el_futuro_score: number | null;
  cuidamos_el_futuro_label: string | null;

  // Additional metrics
  ipe: number | null;  // International Position Evaluation (1-5)

  created_at: string;
  updated_at: string;
}

// Evaluation Comment type
export interface EvaluationComment {
  id: string;
  evaluation_id: string;
  category: string;
  comment_text: string | null;
  created_at: string;
  updated_at: string;
}

// Employee with their evaluation data
export interface EmployeeWithEvaluation {
  employee: Employee;
  evaluation: PerformanceEvaluation | null;
  full_name: string;
}

// Team summary statistics
export interface TeamSummary {
  totalDirectReports: number;
  averagePotential: number;
  averageCompetencies: number;
  highPerformers: number; // Count of employees with potential >= 3.0
}

// Competency data for radar chart
export interface CompetencyData {
  name: string;
  score: number;
  label: string | null;
}

// Employee detail with full data
export interface EmployeeDetail {
  employee: Employee;
  evaluation: PerformanceEvaluation | null;
  comments: EvaluationComment[];
  competencies: CompetencyData[];
  full_name: string;
}

// Helper type for team performance query result
export interface TeamPerformanceRow {
  employee_id: string;
  employee_code: number;
  full_name: string;
  email: string;
  general_potential: number | null;
  general_potential_label: string | null;
  competencies_avg_score: number | null;
  competencies_avg_label: string | null;
  direct_manager_score: number | null;
  direct_manager_label: string | null;
}

// Color coding for performance scores
export type PerformanceLevel = 'low' | 'medium' | 'high' | 'excellent';

export interface PerformanceColor {
  level: PerformanceLevel;
  color: string;
  bgColor: string;
  textColor: string;
}

// Helper function to get performance level based on score (1-5 scale)
export function getPerformanceLevel(score: number | null): PerformanceLevel {
  if (score === null) return 'medium';
  if (score >= 3.3) return 'excellent';   // Azul
  if (score >= 3.0) return 'high';        // Verde
  if (score >= 2.71) return 'medium';     // Amarillo
  return 'low';                            // Naranja
}

// Helper function to get color for performance level
export function getPerformanceColor(score: number | null): PerformanceColor {
  const level = getPerformanceLevel(score);

  const colors: Record<PerformanceLevel, PerformanceColor> = {
    excellent: {
      level: 'excellent',
      color: 'text-white',
      bgColor: 'bg-[#271DED]',  // Azul - Score >= 3.3
      textColor: 'text-white'
    },
    high: {
      level: 'high',
      color: 'text-white',
      bgColor: 'bg-[#257916]',  // Verde - Score >= 3.0 y < 3.3
      textColor: 'text-white'
    },
    medium: {
      level: 'medium',
      color: 'text-black',
      bgColor: 'bg-[#FFDB3D]',  // Amarillo - Score >= 2.71 y < 3.0
      textColor: 'text-black'
    },
    low: {
      level: 'low',
      color: 'text-white',
      bgColor: 'bg-[#FF5D38]',  // Naranja - Score < 2.71
      textColor: 'text-white'
    }
  };

  return colors[level];
}

// Historic data types for individual view
export interface YearData {
  score: number | null;
  label: string | null;
}

export interface MetricRow {
  metricName: string;
  yearData: Record<number, YearData>;  // year -> { score, label }
  average: number | null;
}

export interface HistoricEvaluationData {
  employee: Employee;
  evaluationsByYear: Record<number, PerformanceEvaluation>;  // year -> evaluation
  availableYears: number[];
  metrics: MetricRow[];
}
