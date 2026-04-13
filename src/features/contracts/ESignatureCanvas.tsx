/**
 * ESignatureCanvas — HTML5 Canvas signature pad.
 *
 * Supports mouse and touch drawing. Produces a base64 PNG data URL
 * on confirm. Shows a checkmark state once signed.
 */

import { useRef, useState, useEffect, useCallback } from "react";
import { CheckCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ESignatureCanvasProps {
  label?: string;
  onSign: (dataUrl: string) => void;
  onClear?: () => void;
  className?: string;
  disabled?: boolean;
}

export function ESignatureCanvas({
  label = "Sign here",
  onSign,
  onClear,
  className,
  disabled = false,
}: ESignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const hasStrokesRef = useRef(false);
  const [signed, setSigned] = useState(false);

  // Set canvas dimensions on mount and resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      const ctx = canvas.getContext("2d");
      // Save current drawing before resize
      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = rect.width;
      canvas.height = 140;
      if (ctx) {
        ctx.strokeStyle = "#a78bfa";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        if (imageData) ctx.putImageData(imageData, 0, 0);
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    return () => ro.disconnect();
  }, []);

  const getPos = (
    e: MouseEvent | TouchEvent,
    canvas: HTMLCanvasElement
  ): { x: number; y: number } => {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const touch = e.touches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    return { x: (e as MouseEvent).clientX - rect.left, y: (e as MouseEvent).clientY - rect.top };
  };

  const startDraw = useCallback((e: MouseEvent | TouchEvent) => {
    if (disabled || signed) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    isDrawingRef.current = true;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }, [disabled, signed]);

  const draw = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDrawingRef.current || disabled || signed) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    hasStrokesRef.current = true;
  }, [disabled, signed]);

  const endDraw = useCallback(() => {
    isDrawingRef.current = false;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("mousedown", startDraw);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", endDraw);
    canvas.addEventListener("mouseleave", endDraw);
    canvas.addEventListener("touchstart", startDraw, { passive: false });
    canvas.addEventListener("touchmove", draw, { passive: false });
    canvas.addEventListener("touchend", endDraw);
    return () => {
      canvas.removeEventListener("mousedown", startDraw);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", endDraw);
      canvas.removeEventListener("mouseleave", endDraw);
      canvas.removeEventListener("touchstart", startDraw);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", endDraw);
    };
  }, [startDraw, draw, endDraw]);

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    hasStrokesRef.current = false;
    setSigned(false);
    onClear?.();
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasStrokesRef.current) return;
    const dataUrl = canvas.toDataURL("image/png");
    setSigned(true);
    onSign(dataUrl);
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {label && (
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
      )}

      <div
        className={cn(
          "relative rounded-lg border overflow-hidden",
          signed
            ? "border-green-500/40 bg-green-500/5"
            : "border-violet-500/30 bg-[#16162a]"
        )}
      >
        {/* Baseline guide */}
        {!signed && (
          <div
            className="absolute left-4 right-4 border-b border-dashed border-violet-500/20"
            style={{ top: 100 }}
          />
        )}

        <canvas
          ref={canvasRef}
          style={{ display: "block", width: "100%", height: 140, cursor: disabled || signed ? "default" : "crosshair" }}
        />

        {/* Signed overlay */}
        {signed && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-500/10">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Signed</span>
            </div>
          </div>
        )}

        {/* Placeholder text */}
        {!signed && !hasStrokesRef.current && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-xs text-violet-500/30 select-none">Draw your signature above</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClear}
          disabled={disabled}
          className="gap-1.5 border-violet-500/30 text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Clear
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleConfirm}
          disabled={disabled || signed}
          className="bg-violet-600 hover:bg-violet-500 text-white"
        >
          {signed ? "Signed" : "Confirm Signature"}
        </Button>
      </div>
    </div>
  );
}
