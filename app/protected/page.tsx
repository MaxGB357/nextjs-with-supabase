"use client";

/**
 * Team Performance Dashboard
 * Protected route that displays manager's team performance evaluations
 * Data is automatically filtered by RLS policies to show only manager's direct reports
 */

import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { TeamTable } from "@/components/dashboard/team-table";
import { EmployeeDetailModal } from "@/components/dashboard/employee-detail-modal";
import { YearSelector } from "@/components/dashboard/year-selector";
import {
  getCurrentManager,
  getTeamMembers,
  calculateTeamSummary,
  getEmployeeDetail,
  getAvailableYears
} from "@/lib/services/performance.client.service";
import type { Employee, EmployeeWithEvaluation, TeamSummary, EmployeeDetail } from "@/lib/types/performance.types";

export default function DashboardPage() {
  const [manager, setManager] = useState<Employee | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [availableYears, setAvailableYears] = useState<number[]>([2024]);
  const [teamMembers, setTeamMembers] = useState<EmployeeWithEvaluation[]>([]);
  const [teamSummary, setTeamSummary] = useState<TeamSummary>({
    totalDirectReports: 0,
    averagePotential: 0,
    averageCompetencies: 0,
    highPerformers: 0
  });
  const [employeeDetail, setEmployeeDetail] = useState<EmployeeDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Get current manager
        const managerData = await getCurrentManager();
        setManager(managerData);

        // Get available years
        const years = await getAvailableYears();
        setAvailableYears(years);

        // Get team data for selected year
        const members = await getTeamMembers(selectedYear);
        setTeamMembers(members);

        // Calculate summary
        const summary = calculateTeamSummary(members);
        setTeamSummary(summary);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [selectedYear]);

  // Handle year change
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  // Handle view employee details
  const handleViewDetails = async (employeeId: string) => {
    setIsModalOpen(true);

    try {
      const detail = await getEmployeeDetail(employeeId, selectedYear);
      setEmployeeDetail(detail);
    } catch (error) {
      console.error("Error loading employee details:", error);
    }
  };

  // Handle close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEmployeeDetail(null);
  };

  if (isLoading) {
    return (
      <div className="flex-1 w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      {/* Header */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Mi Equipo</h1>
              <p className="text-sm text-muted-foreground">
                {manager ? `${manager.first_name} ${manager.last_name}` : 'Cargando...'}
              </p>
            </div>
          </div>
          <YearSelector
            selectedYear={selectedYear}
            availableYears={availableYears}
            onYearChange={handleYearChange}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Resumen del Equipo</h2>
        <SummaryCards summary={teamSummary} />
      </div>

      {/* Team Table */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Miembros del Equipo</h2>
        <TeamTable teamMembers={teamMembers} onViewDetails={handleViewDetails} />
      </div>

      {/* Employee Detail Modal */}
      <EmployeeDetailModal
        employeeDetail={employeeDetail}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
