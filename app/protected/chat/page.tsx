"use client";

/**
 * Chat-First Calibration Assistant (Option C)
 * Main interface: Chat with AI + Context sidebar
 * Prototype for user testing
 */

import { useState, useEffect, useCallback } from "react";
import { LayoutDashboard, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChatPanel } from "@/components/chat/chat-panel";
import { ContextSidebar } from "@/components/chat/context-sidebar";
import {
  getCurrentManager,
  getTeamMembers,
  calculateTeamSummary,
} from "@/lib/services/performance.client.service";
import type {
  Employee,
  EmployeeWithEvaluation,
  TeamSummary,
} from "@/lib/types/performance.types";

export default function ChatPage() {
  const [manager, setManager] = useState<Employee | null>(null);
  const [selectedYear] = useState<number>(2024);
  const [teamMembers, setTeamMembers] = useState<EmployeeWithEvaluation[]>([]);
  const [teamSummary, setTeamSummary] = useState<TeamSummary>({
    totalDirectReports: 0,
    averagePotential: 0,
    averageCompetencies: 0,
    highPerformers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  // Shared employee selection logic
  const handleEmployeeSelect = useCallback((employeeKey: string) => {
    setSelectedEmployees((prev) => {
      if (prev.includes(employeeKey)) {
        return prev.filter((k) => k !== employeeKey);
      }
      return [...prev, employeeKey];
    });
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedEmployees([]);
  }, []);

  const handleRemoveFromDetail = useCallback((index: number) => {
    setSelectedEmployees((prev) => prev.filter((_, i) => i !== index));
  }, []);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const managerData = await getCurrentManager();
        setManager(managerData);

        const members = await getTeamMembers(selectedYear);
        setTeamMembers(members);

        const summary = calculateTeamSummary(members);
        setTeamSummary(summary);
      } catch (error) {
        console.error("Error loading data:", error);
        // Use mock data for prototype
        setTeamSummary({
          totalDirectReports: 8,
          averagePotential: 3.6,
          averageCompetencies: 3.8,
          highPerformers: 4,
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [selectedYear]);

  // Map sidebar employee names to EMPLOYEES_DATA keys
  const mapNameToKey = (name: string): string | null => {
    const lower = name.toLowerCase();
    if (lower.includes("paula")) return "paula";
    if (lower.includes("alvaro")) return "alvaro";
    if (lower.includes("anibal")) return "anibal";
    if (lower.includes("angeles")) return "angeles";
    return null;
  };

  const handleSidebarEmployeeClick = (employeeName: string) => {
    const key = mapNameToKey(employeeName);
    if (key) {
      handleEmployeeSelect(key);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 w-full flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-xl shadow-primary/30 mx-auto mb-4 animate-pulse">
            <MessageSquare className="h-8 w-8 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">
            Preparando tu mesa de calibración...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-background via-background to-primary/5">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
            <MessageSquare className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold">Mesa de Calibración</h1>
            <p className="text-xs text-muted-foreground">
              Preparación inteligente
            </p>
          </div>
        </div>
        <Link href="/protected">
          <Button variant="outline" size="sm" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Ver Dashboard
          </Button>
        </Link>
      </div>

      {/* Main Content - Option C Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Context Sidebar (30%) */}
        <div className="w-80 border-r bg-muted/30 flex-shrink-0 hidden md:block">
          <ContextSidebar
            managerName={
              manager
                ? `${manager.first_name} ${manager.last_name}`
                : "Demo Manager"
            }
            selectedYear={selectedYear}
            teamSummary={teamSummary}
            teamMembers={teamMembers}
            onEmployeeClick={handleSidebarEmployeeClick}
            selectedEmployees={selectedEmployees}
          />
        </div>

        {/* Chat Panel (70%) */}
        <div className="flex-1 flex flex-col bg-background overflow-hidden">
          <ChatPanel
            contextData={{
              managerName: manager
                ? `${manager.first_name} ${manager.last_name}`
                : "Demo Manager",
              teamSize: teamSummary.totalDirectReports,
              selectedYear: selectedYear,
            }}
            selectedEmployees={selectedEmployees}
            onEmployeeSelect={handleEmployeeSelect}
            onCloseDetail={handleCloseDetail}
            onRemoveFromDetail={handleRemoveFromDetail}
          />
        </div>
      </div>
    </div>
  );
}
