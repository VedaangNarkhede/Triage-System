const config = {
  Critical: { bg: "bg-neon-red/20", text: "text-neon-red", border: "border-neon-red/40", glow: "shadow-[0_0_10px_rgba(239,68,68,0.3)]" },
  High:     { bg: "bg-neon-orange/20", text: "text-neon-orange", border: "border-neon-orange/40", glow: "shadow-[0_0_10px_rgba(249,115,22,0.3)]" },
  Medium:   { bg: "bg-neon-yellow/20", text: "text-neon-yellow", border: "border-neon-yellow/40", glow: "shadow-[0_0_10px_rgba(234,179,8,0.3)]" },
  Low:      { bg: "bg-neon-green/20", text: "text-neon-green", border: "border-neon-green/40", glow: "shadow-[0_0_10px_rgba(34,197,94,0.3)]" },
  Unknown:  { bg: "bg-text-muted/20", text: "text-text-muted", border: "border-text-muted/40", glow: "" },
};

export default function StatusBadge({ level = "Unknown", size = "sm" }) {
  const c = config[level] || config.Unknown;
  const sizeClass = size === "lg" 
    ? "px-4 py-2 text-sm" 
    : "px-2.5 py-1 text-xs";
  
  return (
    <span className={`
      inline-flex items-center rounded-full font-bold uppercase tracking-wider border
      ${c.bg} ${c.text} ${c.border} ${c.glow} ${sizeClass}
    `}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${c.text.replace("text-", "bg-")}`} />
      {level}
    </span>
  );
}
