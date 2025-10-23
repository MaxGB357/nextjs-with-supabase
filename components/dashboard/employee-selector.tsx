"use client";

import type { Employee } from "@/lib/types/performance.types";

interface EmployeeSelectorProps {
  employees: Employee[];
  selectedEmployeeId: string | null;
  onEmployeeChange: (employeeId: string) => void;
  isLoading?: boolean;
}

export function EmployeeSelector({
  employees,
  selectedEmployeeId,
  onEmployeeChange,
  isLoading = false
}: EmployeeSelectorProps) {
  return (
    <div className="w-full max-w-md">
      <label htmlFor="employee-select" className="block text-sm font-medium mb-2">
        Seleccionar Colaborador
      </label>
      <select
        id="employee-select"
        value={selectedEmployeeId || ""}
        onChange={(e) => onEmployeeChange(e.target.value)}
        disabled={isLoading}
        className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="" disabled>
          Seleccionar colaborador...
        </option>
        {employees.map((employee) => (
          <option key={employee.id} value={employee.id}>
            {employee.first_name} {employee.last_name}
          </option>
        ))}
      </select>
    </div>
  );
}
