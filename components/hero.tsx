import { Sparkles, ClipboardCheck, BarChart3, Users } from "lucide-react";

export function Hero() {
  return (
    <div className="flex flex-col items-center text-center space-y-8">
      {/* Main Heading */}
      <div className="space-y-4 max-w-4xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Sparkles className="h-4 w-4" />
          <span>Gestión de Desempeño Simplificada</span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Evaluaciones de Desempeño
          </span>
          <br />
          <span className="bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent">
            Más Simples y Efectivas
          </span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Una herramienta inteligente para gestionar y analizar las evaluaciones de desempeño de tu equipo de manera eficiente.
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full max-w-3xl">
        <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card border hover:border-primary/50 transition-colors">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <ClipboardCheck className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold">Evaluaciones Rápidas</h3>
          <p className="text-sm text-muted-foreground">Crea y gestiona evaluaciones fácilmente</p>
        </div>

        <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card border hover:border-primary/50 transition-colors">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold">Análisis Detallado</h3>
          <p className="text-sm text-muted-foreground">Métricas y estadísticas en tiempo real</p>
        </div>

        <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card border hover:border-primary/50 transition-colors">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold">Gestión de Equipos</h3>
          <p className="text-sm text-muted-foreground">Seguimiento completo de tu equipo</p>
        </div>
      </div>
    </div>
  );
}
