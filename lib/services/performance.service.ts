/**
 * Performance Service
 * Functions to fetch and manage performance evaluation data
 */

import { createClient } from "@/lib/supabase/server";
import type {
  Employee,
  EvaluationComment,
  EmployeeWithEvaluation,
  TeamSummary,
  EmployeeDetail,
  CompetencyData,
  TeamPerformanceRow
} from "@/lib/types/performance.types";

/**
 * Get the current logged-in manager's information
 */
export async function getCurrentManager(): Promise<Employee | null> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching manager:', error);
    return null;
  }

  return data;
}

/**
 * Get all direct reports for the logged-in manager with their evaluations
 */
export async function getTeamMembers(year: number): Promise<EmployeeWithEvaluation[]> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Get direct reports
  const { data: employees, error: employeesError } = await supabase
    .from('employees')
    .select('*')
    .eq('manager_id', user.id)
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true });

  if (employeesError) {
    console.error('Error fetching employees:', employeesError);
    return [];
  }

  if (!employees || employees.length === 0) return [];

  // Get evaluations for those employees
  const employeeIds = employees.map(e => e.id);
  const { data: evaluations, error: evaluationsError } = await supabase
    .from('performance_evaluations')
    .select('*')
    .in('employee_id', employeeIds)
    .eq('evaluation_year', year);

  if (evaluationsError) {
    console.error('Error fetching evaluations:', evaluationsError);
  }

  // Combine employees with their evaluations
  const teamMembers: EmployeeWithEvaluation[] = employees.map(employee => {
    const evaluation = evaluations?.find(e => e.employee_id === employee.id) || null;
    return {
      employee,
      evaluation,
      full_name: `${employee.first_name} ${employee.last_name}`
    };
  });

  return teamMembers;
}

/**
 * Calculate team summary statistics
 */
export function calculateTeamSummary(teamMembers: EmployeeWithEvaluation[]): TeamSummary {
  const totalDirectReports = teamMembers.length;

  // Calculate averages (only include members with evaluations)
  const membersWithEvaluations = teamMembers.filter(m => m.evaluation !== null);

  let totalPotential = 0;
  let totalCompetencies = 0;
  let potentialCount = 0;
  let competenciesCount = 0;
  let highPerformers = 0;

  membersWithEvaluations.forEach(member => {
    if (member.evaluation) {
      if (member.evaluation.general_potential !== null) {
        totalPotential += member.evaluation.general_potential;
        potentialCount++;

        // Count high performers (potential >= 3.0)
        if (member.evaluation.general_potential >= 3.0) {
          highPerformers++;
        }
      }

      if (member.evaluation.competencies_avg_score !== null) {
        totalCompetencies += member.evaluation.competencies_avg_score;
        competenciesCount++;
      }
    }
  });

  return {
    totalDirectReports,
    averagePotential: potentialCount > 0 ? totalPotential / potentialCount : 0,
    averageCompetencies: competenciesCount > 0 ? totalCompetencies / competenciesCount : 0,
    highPerformers
  };
}

/**
 * Get detailed information for a specific employee
 */
export async function getEmployeeDetail(employeeId: string, year: number): Promise<EmployeeDetail | null> {
  const supabase = await createClient();

  // Get employee
  const { data: employee, error: employeeError } = await supabase
    .from('employees')
    .select('*')
    .eq('id', employeeId)
    .single();

  if (employeeError || !employee) {
    console.error('Error fetching employee:', employeeError);
    return null;
  }

  // Get evaluation
  const { data: evaluation, error: evaluationError } = await supabase
    .from('performance_evaluations')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('evaluation_year', year)
    .single();

  if (evaluationError && evaluationError.code !== 'PGRST116') {
    console.error('Error fetching evaluation:', evaluationError);
  }

  // Get comments if evaluation exists
  let comments: EvaluationComment[] = [];
  if (evaluation) {
    const { data: commentsData, error: commentsError } = await supabase
      .from('evaluation_comments')
      .select('*')
      .eq('evaluation_id', evaluation.id);

    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
    } else if (commentsData) {
      comments = commentsData;
    }
  }

  // Extract competencies for radar chart
  const competencies: CompetencyData[] = evaluation ? [
    {
      name: 'Un Solo Equipo',
      score: evaluation.somos_un_solo_equipo_score || 0,
      label: evaluation.somos_un_solo_equipo_label
    },
    {
      name: 'Agilmente',
      score: evaluation.nos_movemos_agilmente_score || 0,
      label: evaluation.nos_movemos_agilmente_label
    },
    {
      name: 'Pasión Cliente',
      score: evaluation.nos_apasionamos_por_cliente_score || 0,
      label: evaluation.nos_apasionamos_por_cliente_label
    },
    {
      name: 'Futuro',
      score: evaluation.cuidamos_el_futuro_score || 0,
      label: evaluation.cuidamos_el_futuro_label
    }
  ] : [];

  return {
    employee,
    evaluation: evaluation || null,
    comments,
    competencies,
    full_name: `${employee.first_name} ${employee.last_name}`
  };
}

/**
 * Use the database function to get team performance data
 * This is an alternative to getTeamMembers using the stored procedure
 */
export async function getTeamPerformanceData(year: number): Promise<TeamPerformanceRow[]> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .rpc('get_team_performance', {
      manager_uuid: user.id,
      eval_year: year
    });

  if (error) {
    console.error('Error calling get_team_performance:', error);
    return [];
  }

  return data || [];
}

/**
 * Get list of available evaluation years
 */
export async function getAvailableYears(): Promise<number[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('performance_evaluations')
    .select('evaluation_year')
    .order('evaluation_year', { ascending: false });

  if (error) {
    console.error('Error fetching years:', error);
    return [2024]; // Default fallback
  }

  // Get unique years
  const years = [...new Set(data.map(d => d.evaluation_year))];
  return years.length > 0 ? years : [2024];
}
