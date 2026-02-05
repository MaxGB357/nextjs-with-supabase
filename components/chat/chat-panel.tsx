"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { EmployeeCard, ComparisonCard, EMPLOYEES_DATA } from "./employee-card";
import { EmployeeDetailPanel } from "./employee-detail-panel";

type CardType = "employee" | "comparison" | null;

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  cardType?: CardType;
  cardData?: {
    employeeKey?: string;
    employeeKeys?: string[]; // For multiple employees
  };
}

interface ChatPanelProps {
  onEmployeeSelect?: (employeeKey: string) => void;
  onCloseDetail?: () => void;
  onRemoveFromDetail?: (index: number) => void;
  onYearChange?: (year: number) => void;
  selectedEmployees?: string[];
  contextData?: {
    managerName?: string;
    teamSize?: number;
    selectedYear?: number;
  };
}

// Respuestas mock basadas en datos reales de Supabase
const MOCK_RESPONSES: Record<string, string> = {
  default:
    "Entiendo tu pregunta. Déjame buscar esa información en los datos de tu equipo...",

  saludo: `¡Hola! Soy tu asistente de calibración. Puedo ayudarte a:

• **Consultar evaluaciones** de tu equipo
• **Comparar desempeño** entre colaboradores
• **Identificar alertas** y casos especiales
• **Preparar** tu reunión de calibración

¿Qué te gustaría saber sobre tu equipo?`,

  equipo: `Tu equipo tiene **4 colaboradores** este año:

| Nombre | Potencial | Etiqueta | Competencias |
|--------|-----------|----------|--------------|
| Paula Roa | 2.5 | Medio (Calibrado) | 3.75 Sobresaliente |
| Angeles Zuñiga | 3.0 | Medio + | 3.14 Cumple Satisfactorio |
| Anibal Retamal | 2.5 | Medio (Calibrado) | 2.88 Cumple Parcial |
| Alvaro Marquez | 2.4 | Bajo (Calibrado) | 3.38 Sobresaliente |

¿Quieres que profundice en algún colaborador?`,

  alertas: `Hay **3 alertas** activas en tu equipo:

🔴 **Alvaro Marquez** - Potencial Bajo (2.4)
   → Etiqueta: Bajo (Calibrado)
   → Requiere plan de desarrollo urgente

🟡 **Anibal Retamal** - Competencia baja en cliente
   → "Nos apasionamos por cliente": 2.5 (Bajo lo esperado)
   → Necesita coaching en orientación al cliente

🟢 **Angeles Zuñiga** - Competencia baja en futuro
   → "Cuidamos el futuro": 2.94 (Cumple Parcial)
   → Oportunidad de mejora

¿Necesitas más detalle sobre alguna alerta?`,

  paula: `**Paula Roa**

📊 **Evaluación 2024:**
- Potencial: **2.5** (Medio - Calibrado)
- Jefe Directo: **3.75** (Sobresaliente)
- Competencias: **3.75** (Sobresaliente)

📈 **Competencias detalladas:**
| Competencia | Score | Etiqueta |
|-------------|-------|----------|
| Somos un solo equipo | 4.0 | Sobresaliente |
| Nos movemos ágilmente | 3.5 | Sobresaliente |
| Nos apasionamos por cliente | 3.5 | Sobresaliente |
| Cuidamos el futuro | 4.0 | Sobresaliente |

✅ **Fortaleza:** Mejor evaluada en competencias del equipo.

¿Quieres compararla con otro colaborador?`,

  comparar: `**Comparación: Paula Roa vs Alvaro Marquez**

| Métrica | Paula Roa | Alvaro Marquez |
|---------|-----------|----------------|
| Potencial | 2.5 Medio | 2.4 Bajo |
| Jefe Directo | 3.75 | 3.13 |
| Competencias | 3.75 | 3.38 |
| Somos un equipo | 4.0 | 3.33 |
| Nos movemos ágil | 3.5 | 3.33 |
| Cliente | 3.5 | 3.5 |
| Futuro | 4.0 | 3.33 |

📊 **Análisis:**
- Paula tiene mejor evaluación general
- Alvaro necesita plan de desarrollo por potencial bajo
- Ambos son buenos en orientación al cliente

¿Te ayudo a preparar argumentos para la calibración?`,

  calibracion: `**Preparación para Calibración - Tu Equipo**

📋 **Resumen ejecutivo:**
- Total: 4 colaboradores
- Promedio potencial: 2.6
- Mejor en competencias: Paula Roa (3.75)
- Requiere atención: Alvaro Marquez (potencial 2.4)

🎯 **Temas clave a discutir:**

1. **Desarrollo prioritario:**
   - Alvaro Marquez (potencial bajo, necesita plan)

2. **Fortalezas a mantener:**
   - Paula Roa (excelente en competencias)
   - Angeles Zuñiga (buen potencial 3.0)

3. **Áreas de mejora:**
   - Anibal: orientación al cliente (2.5)
   - Angeles: visión de futuro (2.94)

📝 **Preguntas para el comité:**
- ¿Plan de desarrollo para Alvaro?
- ¿Cómo potenciar a Paula para siguiente nivel?

¿Quieres que prepare un one-pager para la reunión?`,
};

// Llamar a nuestra API route que conecta con LM Studio
async function getLLMResponse(
  messages: { role: string; content: string }[],
): Promise<string> {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "API error");
    }

    const data = await response.json();
    return data.content || "No pude generar una respuesta.";
  } catch (error) {
    console.error("Error calling API:", error);
    // Fallback to mock if API fails
    const mockResult = getMockResponse(
      messages[messages.length - 1]?.content || "",
    );
    return mockResult.content;
  }
}

interface MockResponseResult {
  content: string;
  cardType?: CardType;
  cardData?: {
    employeeKey?: string;
    employeeKeys?: string[];
  };
}

function getMockResponse(message: string): MockResponseResult {
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes("hola") ||
    lowerMessage.includes("ayuda") ||
    lowerMessage.includes("puedes")
  ) {
    return { content: MOCK_RESPONSES.saludo };
  }
  if (
    lowerMessage.includes("equipo") ||
    lowerMessage.includes("team") ||
    lowerMessage.includes("colaboradores")
  ) {
    return { content: MOCK_RESPONSES.equipo };
  }
  if (
    lowerMessage.includes("alerta") ||
    lowerMessage.includes("flag") ||
    lowerMessage.includes("problema")
  ) {
    return { content: MOCK_RESPONSES.alertas };
  }

  // Employee cards
  if (lowerMessage.includes("paula") || lowerMessage.includes("roa")) {
    return {
      content: "Aquí está la información de Paula Roa:",
      cardType: "employee",
      cardData: { employeeKey: "paula" },
    };
  }
  if (lowerMessage.includes("alvaro") || lowerMessage.includes("marquez")) {
    return {
      content: "Aquí está la información de Alvaro Marquez:",
      cardType: "employee",
      cardData: { employeeKey: "alvaro" },
    };
  }
  if (lowerMessage.includes("anibal") || lowerMessage.includes("retamal")) {
    return {
      content: "Aquí está la información de Anibal Retamal:",
      cardType: "employee",
      cardData: { employeeKey: "anibal" },
    };
  }
  if (
    lowerMessage.includes("angeles") ||
    lowerMessage.includes("zuñiga") ||
    lowerMessage.includes("zuniga")
  ) {
    return {
      content: "Aquí está la información de Angeles Zuñiga:",
      cardType: "employee",
      cardData: { employeeKey: "angeles" },
    };
  }

  // Comparison - detect which employees are mentioned
  if (
    lowerMessage.includes("compar") ||
    lowerMessage.includes("vs") ||
    lowerMessage.includes("diferencia") ||
    lowerMessage.includes("todos") ||
    lowerMessage.includes("equipo")
  ) {
    // Detect mentioned employees
    const mentioned: string[] = [];
    if (lowerMessage.includes("paula") || lowerMessage.includes("roa"))
      mentioned.push("paula");
    if (lowerMessage.includes("alvaro") || lowerMessage.includes("marquez"))
      mentioned.push("alvaro");
    if (lowerMessage.includes("anibal") || lowerMessage.includes("retamal"))
      mentioned.push("anibal");
    if (
      lowerMessage.includes("angeles") ||
      lowerMessage.includes("zuñiga") ||
      lowerMessage.includes("zuniga")
    )
      mentioned.push("angeles");

    // If comparing all or team mentioned, show all
    if (
      lowerMessage.includes("todos") ||
      lowerMessage.includes("equipo") ||
      mentioned.length === 0
    ) {
      return {
        content: "Aquí tienes a todo tu equipo para comparar:",
        cardType: "comparison",
        cardData: { employeeKeys: ["paula", "alvaro", "anibal", "angeles"] },
      };
    }

    // If only one mentioned in comparison context, show all
    if (mentioned.length === 1) {
      return {
        content: `Comparación de ${mentioned.length > 1 ? "colaboradores" : "tu equipo"}:`,
        cardType: "comparison",
        cardData: { employeeKeys: ["paula", "alvaro", "anibal", "angeles"] },
      };
    }

    return {
      content: `Comparación entre ${mentioned.length} colaboradores:`,
      cardType: "comparison",
      cardData: { employeeKeys: mentioned },
    };
  }
  if (
    lowerMessage.includes("calibra") ||
    lowerMessage.includes("reuni") ||
    lowerMessage.includes("preparar")
  ) {
    return { content: MOCK_RESPONSES.calibracion };
  }

  return { content: MOCK_RESPONSES.default };
}

export function ChatPanel({
  contextData,
  selectedEmployees = [],
  onEmployeeSelect,
  onCloseDetail,
  onRemoveFromDetail,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: MOCK_RESPONSES.saludo,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleCardClick = (employeeKey: string) => {
    onEmployeeSelect?.(employeeKey);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    // Detect if we need to show a card based on user's question
    const detectCardFromMessage = (
      msg: string,
    ): { cardType?: CardType; cardData?: Message["cardData"] } => {
      const lower = msg.toLowerCase();

      // Employee cards
      if (lower.includes("paula") || lower.includes("roa")) {
        return { cardType: "employee", cardData: { employeeKey: "paula" } };
      }
      if (lower.includes("alvaro") || lower.includes("marquez")) {
        return { cardType: "employee", cardData: { employeeKey: "alvaro" } };
      }
      if (lower.includes("anibal") || lower.includes("retamal")) {
        return { cardType: "employee", cardData: { employeeKey: "anibal" } };
      }
      if (
        lower.includes("angeles") ||
        lower.includes("zuñiga") ||
        lower.includes("zuniga")
      ) {
        return { cardType: "employee", cardData: { employeeKey: "angeles" } };
      }

      // Comparison
      if (
        lower.includes("compar") ||
        lower.includes("vs") ||
        lower.includes("diferencia") ||
        lower.includes("todos") ||
        lower.includes("equipo")
      ) {
        // Detect mentioned employees
        const mentioned: string[] = [];
        if (lower.includes("paula") || lower.includes("roa"))
          mentioned.push("paula");
        if (lower.includes("alvaro") || lower.includes("marquez"))
          mentioned.push("alvaro");
        if (lower.includes("anibal") || lower.includes("retamal"))
          mentioned.push("anibal");
        if (
          lower.includes("angeles") ||
          lower.includes("zuñiga") ||
          lower.includes("zuniga")
        )
          mentioned.push("angeles");

        // If no specific names or "todos"/"equipo", show all
        const keys =
          mentioned.length > 0
            ? mentioned
            : ["paula", "alvaro", "anibal", "angeles"];
        return {
          cardType: "comparison",
          cardData: { employeeKeys: keys },
        };
      }

      return {};
    };

    const cardInfo = detectCardFromMessage(userMessage.content);

    // Call LM Studio API
    const chatHistory = updatedMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    getLLMResponse(chatHistory).then((response) => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
        cardType: cardInfo.cardType,
        cardData: cardInfo.cardData,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const suggestedQuestions = [
    "¿Cómo está mi equipo?",
    "¿Quién tiene alertas?",
    "Cuéntame sobre Paula Roa",
    "Prepara mi calibración",
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Main Chat Area */}
      <div
        className={`flex flex-col flex-1 min-h-0 transition-all duration-300`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b bg-gradient-to-r from-primary/5 via-primary/10 to-transparent">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles className="h-5 w-5 text-primary-foreground animate-pulse" />
          </div>
          <div>
            <h2 className="font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Mesa de Calibración
            </h2>
            <p className="text-xs text-muted-foreground">
              Tu copiloto inteligente para preparar la reunión
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === "user" ? "bg-primary" : "bg-muted"
                }`}
              >
                {message.role === "user" ? (
                  <User className="h-4 w-4 text-primary-foreground" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              <div
                className={`rounded-lg px-4 py-3 max-w-[85%] ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <div className="prose prose-sm dark:prose-invert max-w-none prose-table:text-sm prose-th:px-3 prose-th:py-2 prose-th:bg-muted/50 prose-td:px-3 prose-td:py-2 prose-table:border prose-table:border-border prose-th:border prose-th:border-border prose-td:border prose-td:border-border">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </div>
                {/* Render employee card */}
                {message.cardType === "employee" &&
                  message.cardData?.employeeKey && (
                    <div className="mt-3">
                      <EmployeeCard
                        employee={EMPLOYEES_DATA[message.cardData.employeeKey]}
                        onClick={() =>
                          handleCardClick(message.cardData!.employeeKey!)
                        }
                        isSelected={selectedEmployees.includes(
                          message.cardData.employeeKey,
                        )}
                      />
                    </div>
                  )}
                {/* Render comparison cards - multiple employee cards */}
                {message.cardType === "comparison" &&
                  message.cardData?.employeeKeys &&
                  message.cardData.employeeKeys.length > 0 && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {message.cardData.employeeKeys.map((key) => (
                        <EmployeeCard
                          key={key}
                          employee={EMPLOYEES_DATA[key]}
                          onClick={() => handleCardClick(key)}
                          isSelected={selectedEmployees.includes(key)}
                          compact
                        />
                      ))}
                    </div>
                  )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-muted rounded-lg px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested questions (only show if few messages) */}
        {messages.length <= 2 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-muted-foreground mb-2">
              Prueba preguntar:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setInput(q)}
                >
                  {q}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu pregunta..."
              className="flex-1 resize-none rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              rows={1}
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>

      {/* Bottom Comparison Panel */}
      {selectedEmployees.length > 0 && (
        <EmployeeDetailPanel
          employees={selectedEmployees
            .filter((key) => EMPLOYEES_DATA[key])
            .map((key) => EMPLOYEES_DATA[key])}
          onClose={onCloseDetail || (() => {})}
          onRemove={onRemoveFromDetail}
        />
      )}
    </div>
  );
}
