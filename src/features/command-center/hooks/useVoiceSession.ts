import { useState } from "react";

export function useVoiceSession() {
  const [active, setActive] = useState(false);
  const [transcript, setTranscript] = useState("Voice session idle");
  const toggle = () => {
    setActive((v) => !v);
    setTranscript((t) => (t.includes("idle") ? "Session started (placeholder)" : "Voice session idle"));
  };
  return { active, transcript, toggle };
}
