import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { SupervisorMessage } from "../../hooks/useSupervisor";
import {
  SupervisorResponseCard,
  SupervisorThinkingSkeleton,
  NudgePill,
} from "./SupervisorResponseCard";

// ---------------------------------------------------------------------------
// User message bubble
// ---------------------------------------------------------------------------
function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground leading-relaxed shadow-sm">
        {content}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Session component
// ---------------------------------------------------------------------------
interface SupervisorSessionProps {
  messages: SupervisorMessage[];
  isThinking: boolean;
  className?: string;
}

export function SupervisorSession({
  messages,
  isThinking,
  className,
}: SupervisorSessionProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive or thinking state changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isThinking]);

  if (messages.length === 0 && !isThinking) return null;

  return (
    <div
      className={cn(
        "max-h-[640px] overflow-y-auto rounded-xl border border-border/50 bg-background/40 p-4 space-y-4 scroll-smooth",
        className
      )}
    >
      {messages.map((msg) => {
        if (msg.role === "user") {
          return <UserBubble key={msg.id} content={msg.content} />;
        }

        if (msg.role === "system") {
          return <NudgePill key={msg.id} content={msg.content} />;
        }

        // assistant
        return <SupervisorResponseCard key={msg.id} message={msg} />;
      })}

      {isThinking && <SupervisorThinkingSkeleton />}

      <div ref={bottomRef} />
    </div>
  );
}
