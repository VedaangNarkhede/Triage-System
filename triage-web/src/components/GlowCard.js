export default function GlowCard({ children, className = "", hover = true, neon = "cyan" }) {
  const borderColor = neon === "purple" ? "border-neon-purple/20" : "border-neon-cyan/20";
  const hoverGlow = neon === "purple" ? "glow-purple" : "glow-cyan";
  
  return (
    <div className={`
      gradient-card rounded-2xl border ${borderColor} p-6
      transition-all duration-300
      ${hover ? `hover:border-${neon === "purple" ? "neon-purple/40" : "neon-cyan/40"} ${hoverGlow}` : ""}
      ${className}
    `}>
      {children}
    </div>
  );
}
