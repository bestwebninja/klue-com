import { useState, useRef, KeyboardEvent } from "react";
import { ArrowRight, Bot, Loader2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const QUICK_PROMPTS = [
  "Scan my jobs for storm risk this week",
  "Check for code violations before permit submission",
  "Review my pending draw requests for issues",
  "Find rebate opportunities in my active jobs",
];

const INTENT_LABELS: Record<string, string> = {
  renovation_workflow: "Renovation",
  zoning_entitlement: "Zoning",
  lending_capital: "Lending",
  risk_scan: "Risk Scan",
  document_audit: "Documents",
  rebate_discovery: "Rebates",
  single_agent: "Agent",
  full_audit: "Full Audit",
};

interface NeuralCommandBarProps {
  onSend: (query: string) => void;
  isThinking: boolean;
  lastIntent?: string;
  hasMessages?: boolean;
  className?: string;
}

export function NeuralCommandBar({
  onSend,
  isThinking,
  lastIntent,
  hasMessages = false,
  className,
}: NeuralCommandBarProps) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = value.trim().length > 0 && !isThinking;

  function submit() {
    if (!canSend) return;
    onSend(value.trim());
    setValue("");
  }

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function useQuickPrompt(prompt: string) {
    setValue(prompt);
    textareaRef.current?.focus();
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center rounded-lg bg-primary/15 p-1.5">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">Neural Command OS</p>
            <p className="text-[11px] text-muted-foreground leading-tight">Ask anything about your jobs, risk, documents, or finances</p>
          </div>
        </div>
        {lastIntent && (
          <span className="text-[11px] rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-primary font-medium">
            {INTENT_LABELS[lastIntent] ?? lastIntent}
          </span>
        )}
      </div>

      {/* Input area */}
      <div
        className={cn(
          "relative rounded-xl border transition-all duration-200",
          focused
            ? "border-primary/60 bg-background shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]"
            : "border-border/70 bg-card/60"
        )}
      >
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={
            isThinking
              ? "Kluje is thinking…"
              : "Ask Kluje: "Check my active roofing jobs for storm and code risk" or "Review draw #4""
          }
          disabled={isThinking}
          rows={2}
          className="resize-none border-0 bg-transparent pr-14 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
          {value.length > 0 && (
            <button
              onClick={() => setValue("")}
              className="rounded p-1 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              aria-label="Clear"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <Button
            size="sm"
            onClick={submit}
            disabled={!canSend}
            className="h-7 w-7 rounded-lg p-0"
            aria-label="Send"
          >
            {isThinking ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ArrowRight className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Quick prompts — only shown when no conversation yet */}
      {!hasMessages && !isThinking && (
        <div className="flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => useQuickPrompt(prompt)}
              className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card/50 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/8 hover:text-foreground"
            >
              <Bot className="h-3 w-3 shrink-0" />
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Thinking state indicator */}
      {isThinking && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin text-primary" />
          <span>Routing to agents · analyzing · synthesizing…</span>
        </div>
      )}
    </div>
  );
}
