import { Users, TrendingUp, Award, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { TeamSummary } from "@/lib/types/performance.types";

interface SummaryCardsProps {
  summary: TeamSummary;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    {
      title: "Total Equipo",
      value: summary.totalDirectReports,
      icon: Users,
      description: "Colaboradores directos",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950"
    },
    {
      title: "Promedio Potencial",
      value: summary.averagePotential > 0 ? summary.averagePotential.toFixed(2) : "N/A",
      icon: TrendingUp,
      description: "Potencial del equipo",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950"
    },
    {
      title: "Promedio Competencias",
      value: summary.averageCompetencies > 0 ? summary.averageCompetencies.toFixed(2) : "N/A",
      icon: Award,
      description: "Competencias del equipo",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950"
    },
    {
      title: "Alto Desempeño",
      value: summary.highPerformers,
      icon: Target,
      description: "Potencial ≥ 3.0",
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`h-12 w-12 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{card.title}</p>
                <p className="text-3xl font-bold">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-2">{card.description}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
