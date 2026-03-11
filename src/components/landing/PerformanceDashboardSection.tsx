import { Shield } from 'lucide-react';

const pills = [
  'HIPAA-compliant chat widget',
  '35% more captured leads',
  'Google learns 27% faster',
  'Live in 5 minutes',
];

const bigStats = [
  { value: '35%', label: 'More leads from existing traffic' },
  { value: '27%', label: 'Faster Google ad optimization' },
  { value: '<4s', label: 'Average response time' },
];

const metrics = [
  { label: 'Leads Captured', value: '+35%', change: '↑ This month', changeColor: 'text-green-500' },
  { label: 'Google Ad Learning', value: '27% faster', change: '↑ Cleaner signals', changeColor: 'text-primary' },
  { label: 'Cost Per Lead', value: '$42.10', change: '↓ 47%', changeColor: 'text-green-500' },
];

const miniStats = [
  { value: '3x', label: 'More captured leads' },
  { value: '24/7', label: 'Always responding' },
  { value: '<4s', label: 'Response time' },
];

const PerformanceDashboardSection = () => (
  <section className="px-4 py-16 md:py-24 bg-[hsl(30,33%,97%)]">
    {/* Bounce keyframes for typing dots */}
    <style>{`
      @keyframes typingBounce {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-6px); }
      }
    `}</style>

    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-start">

      {/* ── LEFT COLUMN ── */}
      <div className="reveal opacity-0 translate-y-6 transition-all duration-700">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-primary mb-4">
          Care-Assist — AI Chat Widget
        </p>

        <h2 className="text-2xl md:text-4xl font-extrabold leading-[1.1] tracking-tight mb-4">
          HIPAA Compliant.<br />
          35% More Leads.<br />
          <span className="text-primary">27% Faster</span> Learning.
        </h2>

        <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-md">
          Most centers overlook this. When Care-Assist captures structured, qualified lead data
          consistently — your Google and Meta campaigns receive cleaner conversion signals. Faster
          learning. Better targeting. Lower CPL over time.
        </p>

        {/* Pill badges */}
        <div className="grid grid-cols-2 gap-2.5 mb-8 max-w-md">
          {pills.map((p) => (
            <span
              key={p}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3.5 py-2 text-xs font-semibold text-foreground"
            >
              <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
              {p}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-border/60 mb-8 max-w-md" />

        {/* Big stats row */}
        <div className="flex items-start gap-6 max-w-md">
          {bigStats.map((s, i) => (
            <div key={s.label} className="flex items-start gap-6">
              <div className="text-center flex-1">
                <p className="text-3xl md:text-4xl font-black tracking-tighter text-primary leading-none mb-1">{s.value}</p>
                <p className="text-xs text-muted-foreground leading-snug">{s.label}</p>
              </div>
              {i < bigStats.length - 1 && (
                <div className="w-px h-14 bg-border/60 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT COLUMN — Dark Card ── */}
      <div className="reveal opacity-0 translate-y-6 transition-all duration-700" style={{ transitionDelay: '0.15s' }}>
        <div className="rounded-[2rem] overflow-hidden shadow-2xl shadow-black/30" style={{ backgroundColor: '#1A1614' }}>
          {/* Subtle top glow */}
          <div className="relative">
            <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-primary/10 blur-3xl rounded-full" />
          </div>

          {/* Label */}
          <div className="px-6 pt-6 pb-4">
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-primary">
              Live Performance Dashboard
            </p>
          </div>

          {/* Chat preview */}
          <div className="mx-5 rounded-2xl overflow-hidden border border-white/[0.08]">
            {/* Chat header */}
            <div className="flex items-center gap-3 px-5 py-4 bg-primary">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white">
                CA
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-tight">Care Assist</p>
                <p className="text-xs text-white/60 leading-tight">Here to help</p>
              </div>
            </div>

            {/* Chat body */}
            <div className="px-4 py-5 space-y-4" style={{ backgroundColor: '#252220' }}>
              {/* Bot message */}
              <div className="max-w-[88%]">
                <div className="rounded-2xl rounded-tl-md px-4 py-3 text-sm text-white/80 leading-relaxed" style={{ backgroundColor: '#3a3634' }}>
                  Are you looking for help for yourself or a loved one?
                </div>
              </div>
              {/* User message */}
              <div className="max-w-[80%] ml-auto">
                <div className="rounded-2xl rounded-tr-md px-4 py-3 text-sm text-white font-medium bg-primary leading-relaxed">
                  My son. He needs treatment.
                </div>
              </div>
              {/* Typing indicator */}
              <div className="max-w-[88%]">
                <div className="inline-flex gap-1.5 items-center rounded-2xl rounded-tl-md px-4 py-3.5" style={{ backgroundColor: '#3a3634' }}>
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-2.5 h-2.5 rounded-full bg-primary"
                      style={{
                        animation: 'typingBounce 1.2s ease-in-out infinite',
                        animationDelay: `${i * 0.15}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="mx-5 mt-5 rounded-2xl border border-white/[0.08] divide-y divide-white/[0.08] overflow-hidden">
            {metrics.map((m) => (
              <div key={m.label} className="flex items-center justify-between px-5 py-3.5" style={{ backgroundColor: '#252220' }}>
                <span className="text-sm text-white/50">{m.label}</span>
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-bold text-white">{m.value}</span>
                  <span className={`text-xs font-semibold ${m.changeColor}`}>{m.change}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Mini stat cards */}
          <div className="grid grid-cols-3 gap-2.5 mx-5 mt-4">
            {miniStats.map((s) => (
              <div key={s.label} className="rounded-xl px-3 py-4 text-center border border-white/[0.06]" style={{ backgroundColor: '#252220' }}>
                <p className="text-2xl font-black text-primary leading-none mb-1">{s.value}</p>
                <p className="text-[10px] text-white/40 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>

          {/* HIPAA strip */}
          <div className="mx-5 mt-4 mb-5 rounded-xl flex items-center justify-center gap-2.5 px-4 py-3" style={{ backgroundColor: 'rgba(34,100,50,0.35)' }}>
            <Shield className="w-4 h-4 text-green-500" />
            <p className="text-xs font-semibold text-green-400 tracking-wide">
              HIPAA-Compliant · Audit Logs · Session Controls · Encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default PerformanceDashboardSection;
