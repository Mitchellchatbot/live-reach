import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, Star, Shield, Clock, Zap, Users, TrendingUp, MessageSquare, ArrowRight } from 'lucide-react';
import sarahImg from '@/assets/testimonials/sarah.jpg';
import michaelImg from '@/assets/testimonials/michael.jpg';
import jenniferImg from '@/assets/testimonials/jennifer.jpg';
import { LPDemoWidget } from '@/components/landing/LPDemoWidget';
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
  { value: '3x', label: 'More admissions from the same ad spend' },
  { value: '<3s', label: 'Average visitor response time' },
  { value: '47%', label: 'Lower cost per qualified lead' },
  { value: '24/7', label: 'Coverage — no staffing needed' },
];

const Funnel = () => {
  const navigate = useNavigate();

  const handleCTA = () => navigate('/auth');

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ─── HERO ─── */}
      <section className="relative px-4 pt-10 pb-6 md:pt-16 md:pb-10 overflow-hidden bg-background text-primary">
        {/* Decorative lighter circles */}
        <div className="pointer-events-none absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          {/* Lead-in italic text */}
          <p className="text-lg md:text-2xl italic font-light opacity-90 mb-2 leading-snug">
            You're Already Paying For Traffic.
          </p>
          <p className="text-lg md:text-2xl italic font-light opacity-90 mb-6 leading-snug">
            SEO. Google Ads. Referrals.
          </p>

          {/* Main headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.95] tracking-tight mb-6">
            Never Miss<br />Another Lead
          </h1>

          {/* Sub-headline */}
          <p className="text-xl md:text-3xl font-semibold mb-8 leading-snug">
            <span className="font-bold">Care Assist</span>{' '}
            <span className="font-light">Captures Leads Instantly!</span>
          </p>

          {/* Demo Widget */}
          <div className="flex justify-center mb-6">
            <LPDemoWidget />
          </div>
          <p className="text-xs opacity-70 mb-8">↑ This is what your visitors will experience</p>

          {/* VSL Video Section */}
          <div className="relative aspect-video bg-primary/5 rounded-2xl border-2 border-primary/20 overflow-hidden flex items-center justify-center mb-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-3 hover:bg-primary/25 transition-colors cursor-pointer">
                <div className="w-0 h-0 border-l-[20px] border-l-primary border-y-[14px] border-y-transparent ml-1.5" />
              </div>
              <p className="text-muted-foreground text-sm">Watch how it works</p>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleCTA}
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-xl md:text-2xl px-12 py-7 rounded-2xl shadow-2xl hover:shadow-3xl transition-all font-extrabold tracking-wide"
          >
            Start For Free
          </Button>

          <div className="flex items-center justify-center gap-5 mt-5 text-sm opacity-80">
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> No credit card</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> 7-day free trial</span>
          </div>

          {/* Logo */}
          <div className="mt-8">
            <img src={careAssistLogo} alt="Care Assist" className="h-14 md:h-16 mx-auto brightness-0 invert" />
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="px-4 py-10 bg-background text-foreground">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl md:text-4xl font-extrabold text-primary">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SOCIAL PROOF ─── */}
      <section className="px-4 py-10 bg-background text-foreground border-b border-border">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-1 mb-2">
            <div className="flex -space-x-2 mr-3">
              {avatars.map((src, i) => (
                <img key={i} src={src} alt="Customer" className="w-9 h-9 rounded-full border-2 border-background object-cover" />
              ))}
            </div>
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-primary text-primary" />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Rated 5.0 by 40+ treatment centers</p>
        </div>
      </section>

      {/* ─── BENEFITS ─── */}
      <section className="px-4 py-14 md:py-20 bg-background text-foreground">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-extrabold text-center mb-4">
            Every Click You Pay For Deserves a Conversation
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            You're spending thousands on Google Ads and Meta — but your "Contact Us" form converts at 2%. Here's what happens when every visitor gets a real conversation instead.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center mb-4">
                  <b.icon className="w-5 h-5 text-accent-foreground" />
                </div>
                <h3 className="font-bold text-lg mb-2">{b.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="px-4 py-14 md:py-20 bg-muted text-foreground">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-extrabold mb-12">How It Works</h2>
          <div className="space-y-8 text-left">
            {[
              { step: '1', title: 'Paste One Line of Code', desc: 'Add the widget to your site in under 2 minutes. Works with WordPress, Wix, Squarespace — anything.' },
              { step: '2', title: 'AI Engages Every Visitor', desc: 'Within 3 seconds of landing, visitors get a warm, human-sounding conversation that naturally captures their name, phone, and insurance.' },
              { step: '3', title: 'Your Team Gets Warm Leads', desc: 'Slack ping, email alert, or Salesforce record — your admissions team gets notified instantly with full conversation context.' },
            ].map((s) => (
              <div key={s.step} className="flex gap-5 items-start">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <span className="font-bold text-primary-foreground text-sm">{s.step}</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{s.title}</h3>
                  <p className="text-muted-foreground text-sm">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="px-4 py-14 md:py-20 bg-background text-foreground">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-extrabold text-center mb-12">What Our Clients Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Sarah M.', role: 'Clinical Director', img: sarahImg, quote: 'We went from missing 60% of after-hours inquiries to capturing every single one. CareAssist paid for itself in the first week.' },
              { name: 'Michael R.', role: 'Practice Owner', img: michaelImg, quote: 'The AI sounds so natural that patients don\'t realize they\'re chatting with a bot. Our intake volume doubled within a month.' },
              { name: 'Jennifer L.', role: 'Marketing Director', img: jenniferImg, quote: 'Setup was incredibly fast. We had it running on our site in under 5 minutes and started getting leads the same day.' },
            ].map((t) => (
              <div key={t.name} className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.img} alt={t.name} className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="px-4 py-16 md:py-24 text-center bg-primary text-primary-foreground">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-extrabold mb-4">
            Try It FREE For 7 Days!
          </h2>
          <p className="opacity-80 mb-8">
            Every hour without CareAssist is leads walking away. Start your free trial — live on your site in 5 minutes.
          </p>
          <Button
            onClick={handleCTA}
            size="lg"
            className="bg-foreground text-background hover:bg-foreground/90 text-xl px-12 py-7 rounded-2xl shadow-2xl transition-all font-extrabold"
          >
            Start For Free <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <div className="flex items-center justify-center gap-6 mt-6 text-sm opacity-80">
            <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5" /> No credit card</span>
            <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Live in 5 min</span>
            <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Cancel anytime</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Funnel;
