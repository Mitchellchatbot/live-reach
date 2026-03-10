import { useEffect, useState } from "react";

const points = [
  { highlight: "Free 7-day trial.", detail: "No commitment." },
  { highlight: "One-on-one onboarding session —", detail: "Where we align everything with your intake process." },
  { highlight: "Setup takes five minutes.", detail: "One line of code." },
  { highlight: "Works on any website.", detail: null },
];

const Marketing2 = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Floating orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px] animate-float" />
        <div
          className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-accent/15 blur-[140px] animate-float"
          style={{ animationDelay: "4s" }}
        />
        <div
          className="absolute top-1/3 right-1/4 h-[300px] w-[300px] rounded-full bg-primary/5 blur-[100px] animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground) / 0.08) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground) / 0.08) 1px, transparent 1px)",
          backgroundSize: "4rem 4rem",
        }}
      />

      {/* Mouse-follow glow */}
      <div
        className="pointer-events-none fixed hidden md:block rounded-full"
        style={{
          width: 600,
          height: 600,
          left: mousePos.x - 300,
          top: mousePos.y - 300,
          background: "radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, transparent 70%)",
          filter: "blur(40px)",
          transition: "left 0.3s ease-out, top 0.3s ease-out",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-10 max-w-3xl px-6 md:px-12 py-20">
        {/* Logo */}
        <img src="/favicon.png" alt="Care Assist" className="h-16 md:h-20 animate-fade-in" />

        {/* Offer points */}
        <div className="flex flex-col gap-6 w-full stagger-children">
          {points.map((point, i) => (
            <div
              key={i}
              className="glass rounded-2xl p-6 md:p-8 flex flex-col gap-1 card-interactive text-center"
            >
              <span className="text-xl md:text-2xl font-bold text-foreground">{point.highlight}</span>
              {point.detail && (
                <span className="text-base md:text-lg text-muted-foreground">{point.detail}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Marketing2;
