"use client";

import { useState, useRef, useEffect, useCallback } from "react";

/**
 * HandwritingCanvas — A smooth, dark-themed freehand drawing canvas.
 *
 * Props:
 *   open        — boolean to show/hide
 *   onClose     — function called when user closes
 *   onSubmit    — function(base64PngDataUrl) called with the canvas image
 *   patientName — optional name shown in the header
 */
export default function HandwritingCanvas({ open, onClose, onSubmit, patientName }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#00f0ff");
  const [lineWidth, setLineWidth] = useState(3);
  const [tool, setTool] = useState("pen"); // pen | eraser
  const [history, setHistory] = useState([]);
  const [closing, setClosing] = useState(false);

  // Resize canvas to fill container
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Save current drawing
    const imageData = canvas.width > 0 && canvas.height > 0
      ? canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height)
      : null;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    // Fill with white background for OCR clarity
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Restore drawing if we had one
    if (imageData) {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = imageData.width;
      tempCanvas.height = imageData.height;
      tempCanvas.getContext("2d").putImageData(imageData, 0, 0);
      ctx.drawImage(tempCanvas, 0, 0, rect.width, rect.height);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setClosing(false);
      // Small delay so the DOM is ready
      const timer = setTimeout(resizeCanvas, 50);
      window.addEventListener("resize", resizeCanvas);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", resizeCanvas);
      };
    }
  }, [open, resizeCanvas]);

  // Save state to undo history
  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const data = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-20), data]); // keep last 20 states
  }, []);

  const getPos = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    // Support both mouse and touch
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }, []);

  const startDraw = useCallback(
    (e) => {
      e.preventDefault();
      saveState();
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const pos = getPos(e);

      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = tool === "eraser" ? lineWidth * 4 : lineWidth;
      ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
      ctx.globalCompositeOperation = tool === "eraser" ? "source-over" : "source-over";

      setIsDrawing(true);
    },
    [saveState, getPos, color, lineWidth, tool]
  );

  const draw = useCallback(
    (e) => {
      if (!isDrawing) return;
      e.preventDefault();
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const pos = getPos(e);

      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    },
    [isDrawing, getPos]
  );

  const endDraw = useCallback(
    (e) => {
      if (!isDrawing) return;
      e?.preventDefault?.();
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.closePath();
      setIsDrawing(false);
    },
    [isDrawing]
  );

  const handleUndo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || history.length === 0) return;
    const ctx = canvas.getContext("2d");
    const prevState = history[history.length - 1];
    ctx.putImageData(prevState, 0, 0);
    setHistory((prev) => prev.slice(0, -1));
  }, [history]);

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    saveState();
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
  }, [saveState]);

  const handleSubmit = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onSubmit(dataUrl);
  }, [onSubmit]);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      onClose();
      setClosing(false);
      setHistory([]);
    }, 250);
  }, [onClose]);

  if (!open) return null;

  const colors = [
    { value: "#1a1a2e", label: "Black" },
    { value: "#00f0ff", label: "Cyan" },
    { value: "#a855f7", label: "Purple" },
    { value: "#ef4444", label: "Red" },
    { value: "#22c55e", label: "Green" },
    { value: "#3b82f6", label: "Blue" },
  ];

  const widths = [2, 3, 5, 8];

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-300 ${
        closing ? "opacity-0" : "opacity-100"
      }`}
      style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative z-10 w-[94vw] h-[88vh] max-w-[1400px] rounded-2xl border border-border-subtle overflow-hidden flex flex-col transition-all duration-300 ${
          closing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
        style={{
          background: "linear-gradient(145deg, #1a2332 0%, #111827 100%)",
          boxShadow: "0 0 60px rgba(0, 240, 255, 0.1), 0 25px 50px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✏️</span>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Write Diagnosis</h2>
              {patientName && (
                <p className="text-text-muted text-xs">
                  Patient: <span className="text-neon-cyan">{patientName}</span>
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-lg bg-bg-primary border border-border-subtle flex items-center justify-center text-text-muted hover:text-neon-red hover:border-neon-red/40 transition-all text-lg"
          >
            ✕
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-4 px-6 py-3 border-b border-border-subtle bg-bg-primary/50 flex-wrap">
          {/* Tool selector */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTool("pen")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                tool === "pen"
                  ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40"
                  : "text-text-muted border border-border-subtle hover:text-text-secondary"
              }`}
            >
              🖊️ Pen
            </button>
            <button
              onClick={() => setTool("eraser")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                tool === "eraser"
                  ? "bg-neon-purple/20 text-neon-purple border border-neon-purple/40"
                  : "text-text-muted border border-border-subtle hover:text-text-secondary"
              }`}
            >
              🧹 Eraser
            </button>
          </div>

          {/* Separator */}
          <div className="w-px h-6 bg-border-subtle" />

          {/* Colors */}
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted text-xs mr-1">Color</span>
            {colors.map((c) => (
              <button
                key={c.value}
                onClick={() => {
                  setColor(c.value);
                  setTool("pen");
                }}
                title={c.label}
                className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                  color === c.value && tool === "pen"
                    ? "border-white scale-110 shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                    : "border-transparent"
                }`}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>

          {/* Separator */}
          <div className="w-px h-6 bg-border-subtle" />

          {/* Stroke width */}
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted text-xs mr-1">Size</span>
            {widths.map((w) => (
              <button
                key={w}
                onClick={() => setLineWidth(w)}
                className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                  lineWidth === w
                    ? "border-neon-cyan/40 bg-neon-cyan/10"
                    : "border-border-subtle hover:border-text-muted"
                }`}
              >
                <div
                  className="rounded-full"
                  style={{
                    width: w + 2,
                    height: w + 2,
                    backgroundColor: lineWidth === w ? "#00f0ff" : "#64748b",
                  }}
                />
              </button>
            ))}
          </div>

          {/* Separator */}
          <div className="w-px h-6 bg-border-subtle" />

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleUndo}
              disabled={history.length === 0}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted border border-border-subtle hover:text-text-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              ↩ Undo
            </button>
            <button
              onClick={handleClear}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-neon-red/70 border border-neon-red/20 hover:bg-neon-red/10 hover:text-neon-red transition-all"
            >
              🗑️ Clear
            </button>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="gradient-btn-cyan text-bg-primary font-bold py-2 px-6 rounded-xl text-sm hover:shadow-[0_0_25px_rgba(0,240,255,0.3)] transition-all duration-300 uppercase tracking-wider"
          >
            Submit Diagnosis
          </button>
        </div>

        {/* Canvas Area */}
        <div ref={containerRef} className="flex-1 relative cursor-crosshair overflow-hidden">
          {/* Subtle lined guide pattern */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.05]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 31px, #94a3b8 31px, #94a3b8 32px)",
            }}
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 touch-none"
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
          />
        </div>

        {/* Footer hint */}
        <div className="px-6 py-2 border-t border-border-subtle bg-bg-primary/50 flex items-center justify-between">
          <p className="text-text-muted text-xs">
            ✍️ Write your diagnosis clearly. The handwriting will be processed through OCR.
          </p>
          <p className="text-text-muted text-xs">
            Tip: Use dark colors for best OCR accuracy
          </p>
        </div>
      </div>
    </div>
  );
}
