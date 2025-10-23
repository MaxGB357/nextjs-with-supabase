"use client";

import { Users, User } from "lucide-react";

interface ViewToggleProps {
  currentView: "team" | "individual";
  onViewChange: (view: "team" | "individual") => void;
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center rounded-lg bg-muted p-1 gap-1">
      <button
        onClick={() => onViewChange("team")}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
          ${
            currentView === "team"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }
        `}
      >
        <Users className="h-4 w-4" />
        Mi Equipo
      </button>
      <button
        onClick={() => onViewChange("individual")}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
          ${
            currentView === "individual"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }
        `}
      >
        <User className="h-4 w-4" />
        Vista Individual
      </button>
    </div>
  );
}
