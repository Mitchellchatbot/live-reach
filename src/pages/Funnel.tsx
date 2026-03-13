import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Star, Shield, Clock, Zap, Users, TrendingUp, MessageSquare, ArrowRight, Play, BarChart3, Heart } from 'lucide-react';
import sarahImg from '@/assets/testimonials/sarah.jpg';
import michaelImg from '@/assets/testimonials/michael.jpg';
import jenniferImg from '@/assets/testimonials/jennifer.jpg';
import { SalesChatBotInline } from '@/components/landing/SalesChatBotInline';
import { SalesChatBot } from '@/components/landing/SalesChatBot';
import PerformanceDashboardSection from '@/components/landing/PerformanceDashboardSection';
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

  const [showStickyFooter, setShowStickyFooter] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const handleCTA = () => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  useEffect(() => {
    // Load Meta Pixel Code
    const fbScript = document.createElement('script');
    fbScript.innerHTML = `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '34129783716666250');
fbq('track', 'PageView');`;
    document.head.appendChild(fbScript);

    // Track Lead event
    const leadScript = document.createElement('script');
    leadScript.innerHTML = `fbq('track', 'Lead');`;
    document.head.appendChild(leadScript);

    // Load LeadConnector embed script
    const script = document.createElement('script');
    script.src = 'https://link.msgsndr.com/js/form_embed.js';
    script.type = 'text/javascript';
    script.async = true;
    document.body.appendChild(script);
    return () => { 
      if (document.body.contains(script)) document.body.removeChild(script);
      if (document.head.contains(fbScript)) document.head.removeChild(fbScript);
      if (document.head.contains(leadScript)) document.head.removeChild(leadScript);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setShowStickyFooter(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div ref={scrollRef} className="min-h-screen bg-background text-foreground pb-20 md:pb-0">

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative px-4 pt-6 pb-6 md:pt-20 md:pb-14 overflow-hidden bg-background">
        {/* Ambient background blobs */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-[500px] h-[500px] rounded-full bg-primary/15 blur-[120px] animate-[pulse_6s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[140px] animate-[pulse_8s_ease-in-out_infinite]" style={{ animationDelay: '3s' }} />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/[0.03] blur-[100px]" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          {/* Social proof badge */}
          <div className="inline-flex items-center gap-2 bg-muted/60 rounded-full px-4 py-1.5 mb-3 md:mb-6 animate-fade-in" style={{ animationDelay: '0.05s', animationFillMode: 'both' }}>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />
              ))}
            </div>
            <span className="text-xs font-semibold text-foreground">5.0</span>
            <span className="text-xs text-muted-foreground">from 40+ treatment centers</span>
          </div>


          {/* Main headline — dramatic */}
          <div className="animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'both', filter: 'drop-shadow(0 6px 20px hsl(var(--primary) / 0.35))' }}>
            <h1
              style={{
                fontSize: 'clamp(2.6rem, 12vw, 8rem)',
                fontWeight: 900,
                lineHeight: 0.88,
                letterSpacing: '-0.04em',
                textTransform: 'uppercase' as const,
                marginBottom: '1rem',
                background: 'linear-gradient(135deg, hsl(24 100% 55%) 0%, hsl(20 100% 48%) 50%, hsl(28 100% 55%) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Never Miss<br />Another Lead
            </h1>
          </div>

          {/* Sub-headline */}
          <p className="text-base md:text-2xl mb-5 md:mb-10 animate-fade-in max-w-md mx-auto" style={{ animationDelay: '0.55s', animationFillMode: 'both' }}>
            <span className="font-extrabold text-foreground">Care Assist</span>{' '}
            <span className="text-muted-foreground">captures an additional <span className="font-bold text-primary">35% more leads</span> from your existing website traffic.</span>
          </p>

          {/* CTA Button — visible on mobile load */}
          <div className="relative inline-block reveal opacity-0 translate-y-4 transition-all duration-700" style={{ transitionDelay: '0.15s' }}>
            <div className="absolute -inset-1 rounded-2xl bg-primary/30 blur-lg animate-[pulse_2.5s_ease-in-out_infinite]" />
            <Button
              onClick={handleCTA}
              size="lg"
              className="relative bg-primary text-primary-foreground hover:bg-primary/90 text-lg md:text-2xl px-10 py-6 md:px-14 md:py-7 rounded-2xl shadow-2xl hover:shadow-primary/40 hover:scale-[1.03] transition-all duration-300 font-extrabold tracking-wide"
            >
              Start For Free
            </Button>
          </div>

          <div className="flex flex-col items-center gap-1.5 mt-4 md:mt-6 reveal opacity-0 transition-all duration-700" style={{ transitionDelay: '0.3s' }}>
            <p className="text-xs md:text-sm font-semibold text-foreground">Free trial · Plans starting at <span className="text-primary">$150/mo</span></p>
            <div className="flex items-center justify-center gap-4 md:gap-5 text-xs md:text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary/15"><Check className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary" /></span> No credit card</span>
              <span className="flex items-center gap-1.5"><span className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary/15"><Check className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary" /></span> Cancel anytime</span>
            </div>
          </div>

          {/* VSL Vimeo Embed — below CTA on mobile */}
          <div className="relative max-w-2xl mx-auto mt-8 md:mt-10 animate-fade-in" style={{ animationDelay: '0.7s', animationFillMode: 'both' }}>
            <div className="relative rounded-2xl overflow-hidden shadow-xl border-2 border-primary/30 bg-background p-1">
              <div className="aspect-video rounded-xl overflow-hidden">
                <iframe
                  src="https://player.vimeo.com/video/1172714416?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&muted=1&loop=1&background=1"
                  className="w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                  title="Care Assist — Watch How It Works"
                />
              </div>
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

      {/* ═══════════════ GET STARTED FORM ═══════════════ */}
      <section className="px-4 py-12 md:py-16 bg-muted/40" ref={formRef} id="get-started-form">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3 reveal opacity-0 translate-y-4 transition-all duration-700">
            Get Started For Free
          </h2>
          <p className="text-muted-foreground mb-6 text-sm md:text-base max-w-md mx-auto reveal opacity-0 transition-all duration-700" style={{ transitionDelay: '0.1s' }}>
            Fill out the form below and we'll get your AI agent set up in minutes.
          </p>
          <div className="w-full rounded-2xl overflow-hidden border border-border/50 shadow-lg bg-card p-4 md:p-6 reveal opacity-0 translate-y-4 transition-all duration-700" style={{ transitionDelay: '0.2s' }}>
            <iframe
              src="https://api.leadconnectorhq.com/widget/survey/VarcMdVarl1QzePQtEih"
              style={{ width: '100%', border: 'none', overflow: 'hidden', minHeight: '600px' }}
              scrolling="no"
              id="VarcMdVarl1QzePQtEih"
              title="Get Started Survey"
            />
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
                className="group relative bg-gradient-to-br from-card to-muted/50 border border-border/60 rounded-2xl p-7 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1.5 transition-all duration-300 reveal opacity-0 translate-y-6 overflow-hidden"
                style={{ transitionDelay: `${i * 0.08}s` }}
              >
                {/* Subtle accent glow */}
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors duration-500" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/15 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                    <b.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                  </div>
                  <h3 className="font-bold text-lg mb-2.5 text-foreground">{b.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{b.description}</p>
                </div>
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

      {/* ═══════════════ PERFORMANCE DASHBOARD ═══════════════ */}
      <PerformanceDashboardSection />

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
                <span className="flex items-center gap-1.5"><span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/15"><Check className="w-3.5 h-3.5 text-primary" /></span> No credit card</span>
                <span className="flex items-center gap-1.5"><span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/15"><Check className="w-3.5 h-3.5 text-primary" /></span> Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating sales chat widget */}
      <SalesChatBot />

      {/* ═══════════════ STICKY FOOTER CTA (mobile) ═══════════════ */}
      <div className={`fixed bottom-0 inset-x-0 z-40 md:hidden transition-transform duration-300 ${showStickyFooter ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="bg-card/95 backdrop-blur-lg border-t border-border/50 px-4 py-3 flex gap-2.5">
          <Button
            onClick={handleCTA}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl py-3 text-sm font-bold shadow-md shadow-primary/20"
          >
            Start For Free
          </Button>
          <Button
            onClick={handleCTA}
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
