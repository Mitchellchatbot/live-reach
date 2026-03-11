import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Star, Shield, Clock, Zap, Users, TrendingUp, MessageSquare, ArrowRight, Play, BarChart3, Heart } from 'lucide-react';
import sarahImg from '@/assets/testimonials/sarah.jpg';
import michaelImg from '@/assets/testimonials/michael.jpg';
import jenniferImg from '@/assets/testimonials/jennifer.jpg';
import { SalesChatBotInline } from '@/components/landing/SalesChatBotInline';
import { SalesChatBot } from '@/components/landing/SalesChatBot';
import careAssistLogo from '@/assets/care-assist-logo.png';

const avatars = [sarahImg, michaelImg, jenniferImg];

const benefits = [
  {
    icon: MessageSquare,
    title: 'AI That Sounds Human',
    description: 'Visitors can\'t tell they\'re chatting with AI. Natural typos, pacing, and tone that builds real trust.',
  },
  {
    icon: Clock,
    title: 'Responds in Seconds, 24/7',
    description: 'Never miss another lead. Your AI agent is always online — nights, weekends, and holidays.',
  },
  {
    icon: TrendingUp,
    title: 'Captures Leads Automatically',
    description: 'Names, phone numbers, emails, and insurance info — extracted naturally mid-conversation.',
  },
  {
    icon: Shield,
    title: 'HIPAA-Ready Compliance',
    description: 'Built-in data retention policies, audit logs, and session timeouts for healthcare practices.',
  },
  {
    icon: Zap,
    title: 'Live in Under 5 Minutes',
    description: 'Paste one line of code on your site. Your AI agent starts converting visitors immediately.',
  },
  {
    icon: Users,
    title: 'Seamless Human Handoff',
    description: 'When it matters most, conversations escalate to your team instantly — with full context.',
  },
];

const stats = [
  { value: '+47%', label: 'More Leads Captured', icon: BarChart3 },
  { value: '<4s', label: 'Avg Response Time', icon: Clock },
  { value: '24/7', label: 'Always Available', icon: Zap },
  { value: '100+', label: 'Treatment Centers', icon: Heart },
];

/* ── Scroll-triggered fade-in observer ── */
const useScrollReveal = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const children = el.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    children.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, []);
  return ref;
};

const Funnel = () => {
  const navigate = useNavigate();
  const scrollRef = useScrollReveal();

  const handleCTA = () => navigate('/auth');

  return (
    <div ref={scrollRef} className="min-h-screen bg-background text-foreground pb-20 md:pb-0">

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative px-4 pt-12 pb-10 md:pt-20 md:pb-14 overflow-hidden bg-background">
        {/* Ambient background blobs */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-[500px] h-[500px] rounded-full bg-primary/15 blur-[120px] animate-[pulse_6s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[140px] animate-[pulse_8s_ease-in-out_infinite]" style={{ animationDelay: '3s' }} />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/[0.03] blur-[100px]" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          {/* Social proof badge */}
          <div className="inline-flex items-center gap-2 bg-muted/60 rounded-full px-4 py-1.5 mb-6 animate-fade-in" style={{ animationDelay: '0.05s', animationFillMode: 'both' }}>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />
              ))}
            </div>
            <span className="text-xs font-semibold text-foreground">5.0</span>
            <span className="text-xs text-muted-foreground">from 40+ treatment centers</span>
          </div>

          {/* Lead-in text with stagger */}
          <p className="text-base md:text-xl italic font-light text-muted-foreground mb-1.5 animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            You're Already Paying For Traffic.
          </p>
          <p className="text-base md:text-xl italic font-light text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '0.25s', animationFillMode: 'both' }}>
            SEO. Google Ads. Referrals.
          </p>

          {/* Main headline — dramatic */}
          <h1
            className="text-primary animate-fade-in"
            style={{
              fontSize: 'clamp(2.8rem, 10vw, 7rem)',
              fontWeight: 900,
              lineHeight: 0.92,
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
              marginBottom: '1.5rem',
              textShadow: '0 4px 30px hsl(var(--primary) / 0.25)',
              animationDelay: '0.4s',
              animationFillMode: 'both',
            }}
          >
            Never Miss<br />Another Lead
          </h1>

          {/* Sub-headline */}
          <p className="text-lg md:text-2xl mb-10 animate-fade-in" style={{ animationDelay: '0.55s', animationFillMode: 'both' }}>
            <span className="font-extrabold text-foreground">Care Assist</span>{' '}
            <span className="font-light text-muted-foreground">Captures Leads Instantly!</span>
          </p>

          {/* VSL Video Section — hero position */}
          <div className="relative max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.7s', animationFillMode: 'both' }}>
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-primary/25 via-primary/10 to-transparent blur-md" />
            <div className="relative aspect-video bg-gradient-to-br from-muted to-background rounded-2xl border-2 border-primary/20 overflow-hidden flex items-center justify-center shadow-2xl shadow-primary/10">
              <div className="text-center group cursor-pointer">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary/30 group-hover:scale-110 group-hover:shadow-primary/50 transition-all duration-300">
                  <Play className="w-8 h-8 text-primary-foreground ml-1" fill="currentColor" />
                </div>
                <p className="text-muted-foreground text-sm font-medium">Watch how it works</p>
              </div>
            </div>
          </div>

          {/* CTA Button — pulsing glow */}
          <div className="relative inline-block reveal opacity-0 translate-y-4 transition-all duration-700" style={{ transitionDelay: '0.15s' }}>
            <div className="absolute -inset-1 rounded-2xl bg-primary/30 blur-lg animate-[pulse_2.5s_ease-in-out_infinite]" />
            <Button
              onClick={handleCTA}
              size="lg"
              className="relative bg-primary text-primary-foreground hover:bg-primary/90 text-xl md:text-2xl px-14 py-7 rounded-2xl shadow-2xl hover:shadow-primary/40 hover:scale-[1.03] transition-all duration-300 font-extrabold tracking-wide"
            >
              Start For Free
            </Button>
          </div>

          <div className="flex flex-col items-center gap-2 mt-6 reveal opacity-0 transition-all duration-700" style={{ transitionDelay: '0.3s' }}>
            <p className="text-sm font-semibold text-foreground">Free trial · Plans starting at <span className="text-primary">$150/mo</span></p>
            <div className="flex items-center justify-center gap-5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-primary" /> No credit card</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-primary" /> Cancel anytime</span>
            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════ STATS ═══════════════ */}
      <section className="px-4 py-8 bg-background">
        <div className="max-w-md md:max-w-4xl mx-auto">
          <div className="rounded-3xl bg-card border border-border/60 p-5 md:px-10 md:py-8 shadow-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 divide-x-0 md:divide-x divide-border/40">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className="text-center reveal opacity-0 translate-y-4 transition-all duration-700 flex flex-col items-center"
                  style={{ transitionDelay: `${i * 0.08}s` }}
                >
                  <div className="w-14 h-14 rounded-full border-2 border-primary/20 flex items-center justify-center mb-3">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-3xl md:text-4xl font-black tracking-tighter leading-none mb-1 text-primary">
                    {stat.value}
                  </p>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground leading-snug">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Divider between rows on mobile */}
            <div className="border-t border-border/40 my-4 md:hidden" />
          </div>
        </div>
      </section>


      {/* ═══════════════ BENEFITS ═══════════════ */}
      <section className="px-4 py-16 md:py-24 bg-background">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-extrabold text-center mb-3 reveal opacity-0 translate-y-4 transition-all duration-700">
            Every Click You Pay For<br className="hidden md:block" /> Deserves a Conversation
          </h2>
          <p className="text-center text-muted-foreground mb-14 max-w-2xl mx-auto reveal opacity-0 transition-all duration-700">
            You're spending thousands on Google Ads and Meta — but your "Contact Us" form converts at 2%. Here's what happens when every visitor gets a real conversation instead.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((b, i) => (
              <div
                key={b.title}
                className="group relative bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 reveal opacity-0 translate-y-6"
                style={{ transitionDelay: `${i * 0.08}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <b.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-foreground">{b.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section className="px-4 py-16 md:py-24 bg-muted">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-extrabold mb-14 reveal opacity-0 translate-y-4 transition-all duration-700">How It Works</h2>
          <div className="space-y-6 text-left">
            {[
              { step: '1', title: 'Paste One Line of Code', desc: 'Add the widget to your site in under 2 minutes. Works with WordPress, Wix, Squarespace — anything.' },
              { step: '2', title: 'AI Engages Every Visitor', desc: 'Within 3 seconds of landing, visitors get a warm, human-sounding conversation that naturally captures their name, phone, and insurance.' },
              { step: '3', title: 'Your Team Gets Warm Leads', desc: 'Slack ping, email alert, or Salesforce record — your admissions team gets notified instantly with full conversation context.' },
            ].map((s, i) => (
              <div key={s.step} className="flex gap-5 items-start bg-background rounded-2xl p-5 border border-border shadow-sm reveal opacity-0 translate-y-4 transition-all duration-700" style={{ transitionDelay: `${i * 0.12}s` }}>
                <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
                  <span className="font-bold text-primary-foreground">{s.step}</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{s.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ TESTIMONIALS ═══════════════ */}
      <section className="px-4 py-16 md:py-24 bg-background">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-extrabold text-center mb-14 reveal opacity-0 translate-y-4 transition-all duration-700">What Our Clients Say</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: 'Sarah M.', role: 'Clinical Director', img: sarahImg, quote: 'We went from missing 60% of after-hours inquiries to capturing every single one. CareAssist paid for itself in the first week.' },
              { name: 'Michael R.', role: 'Practice Owner', img: michaelImg, quote: 'The AI sounds so natural that patients don\'t realize they\'re chatting with a bot. Our intake volume doubled within a month.' },
              { name: 'Jennifer L.', role: 'Marketing Director', img: jenniferImg, quote: 'Setup was incredibly fast. We had it running on our site in under 5 minutes and started getting leads the same day.' },
            ].map((t, i) => (
              <div key={t.name} className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 reveal opacity-0 translate-y-6" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="flex items-center gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-5 font-medium">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.img} alt={t.name} className="w-10 h-10 rounded-full object-cover border-2 border-primary/20 shadow-sm" />
                  <div>
                    <p className="font-bold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FINAL CTA WITH SALES CHAT ═══════════════ */}
      <section className="relative px-4 py-16 md:py-24 text-center overflow-hidden bg-background">
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-primary/8 blur-[120px]" />

        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-5xl font-black mb-3 tracking-tight text-foreground reveal opacity-0 translate-y-4 transition-all duration-700">
            Try It FREE For 7 Days!
          </h2>
          <p className="text-muted-foreground mb-10 text-lg max-w-xl mx-auto reveal opacity-0 transition-all duration-700" style={{ transitionDelay: '0.1s' }}>
            Every hour without CareAssist is leads walking away. Ask our AI anything about the product — or start your free trial now.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
            {/* Sales Chat Widget — inline */}
            <div className="w-full max-w-[380px] reveal opacity-0 translate-y-6 transition-all duration-700" style={{ transitionDelay: '0.2s' }}>
              <div className="relative">
                <div className="absolute -inset-2 rounded-3xl bg-primary/10 blur-lg" />
                <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 border border-border">
                  <SalesChatBotInline />
                </div>
              </div>
            </div>

            {/* CTA side */}
            <div className="flex flex-col items-center gap-5 reveal opacity-0 translate-y-4 transition-all duration-700" style={{ transitionDelay: '0.35s' }}>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Or skip the chat</p>
              <div className="relative inline-block">
                <div className="absolute -inset-1 rounded-2xl bg-primary/30 blur-lg animate-[pulse_2.5s_ease-in-out_infinite]" />
                <Button
                  onClick={handleCTA}
                  size="lg"
                  className="relative bg-primary text-primary-foreground hover:bg-primary/90 text-xl px-14 py-7 rounded-2xl shadow-2xl hover:shadow-primary/40 hover:scale-[1.03] transition-all duration-300 font-extrabold"
                >
                  Start Now <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
              <div className="flex items-center justify-center gap-5 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-primary" /> No credit card</span>
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-primary" /> Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating sales chat widget */}
      <SalesChatBot />

      {/* ═══════════════ STICKY FOOTER CTA (mobile) ═══════════════ */}
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden">
        <div className="bg-card/95 backdrop-blur-lg border-t border-border/50 px-4 py-3 flex gap-2.5">
          <Button
            onClick={handleCTA}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl py-3 text-sm font-bold shadow-md shadow-primary/20"
          >
            Start For Free
          </Button>
          <Button
            onClick={() => window.open('https://calendly.com/care-assist-support/support-call-clone', '_blank')}
            variant="outline"
            className="flex-1 border-primary/30 text-primary hover:bg-accent rounded-xl py-3 text-sm font-bold"
          >
            Book a Demo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Funnel;
