import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { Hero } from "@/components/hero";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg hover:text-primary transition-colors">
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Asistente Evaluaciones
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-16 md:py-24">
        <div className="container max-w-6xl mx-auto">
          <Hero />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-auto">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
            <p>
              © 2025 Asistente Evaluaciones de Desempeño
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
