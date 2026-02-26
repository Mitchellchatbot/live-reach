import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, Star, Shield, Clock, Zap, Users, TrendingUp, MessageSquare, Building2, ArrowRight } from 'lucide-react';
import sarahImg from '@/assets/testimonials/sarah.jpg';
import michaelImg from '@/assets/testimonials/michael.jpg';
import jenniferImg from '@/assets/testimonials/jennifer.jpg';
import { ChatWidget } from '@/components/widget/ChatWidget';
import { cn } from '@/lib/utils';

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
  { value: '3x', label: 'More leads from ad spend' },
  { value: '24/7', label: 'Always-on coverage' },
  { value: '47%', label: 'Lower cost per lead' },
  { value: '93%', label: 'Visitor satisfaction' },
];

// Placeholder logo slots — replace with actual uploaded logos
const trustedLogos = [
  { name: 'Company 1' },
  { name: 'Company 2' },
  { name: 'Company 3' },
  { name: 'Company 4' },
  { name: 'Company 5' },
  { name: 'Company 6' },
];

const Funnel = () => {
  const navigate = useNavigate();

  const handleCTA = () => navigate('/auth');

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative px-4 pt-12 pb-8 md:pt-20 md:pb-14">
        <div className="max-w-3xl mx-auto text-center">
          {/* Social proof avatars */}
          <div className="flex items-center justify-center gap-1 mb-3">
            <div className="flex -space-x-2">
              {avatars.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt="Happy customer"
                  className="w-9 h-9 rounded-full border-2 border-background object-cover"
                />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center gap-1 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-primary text-primary" />
            ))}
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            5.0 from 40+ treatment centers
          </p>

          {/* Target qualifier */}
          <p className="text-primary font-semibold text-base md:text-lg mb-4">
            For Treatment Centers & Healthcare Practices Running Website + Paid Media:
          </p>

          {/* Headline */}
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight mb-5 text-foreground">
            Convert More of Your{' '}
            <span className="underline decoration-primary decoration-4 underline-offset-4">
              Website Visitors & Ad Traffic
            </span>{' '}
            Into Booked Patients — On Autopilot
          </h1>

          {/* Sub-headline */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Whether they come from Google Ads, Meta, or organic search — our AI chat agent engages every visitor <strong className="text-foreground">the second they land</strong>, captures their info naturally, and turns clicks into qualified leads 24/7.
          </p>

          {/* Embedded Demo Widget */}
          <div className="flex justify-center mt-4">
            <ChatWidget
              propertyId="demo"
              isPreview={true}
              autoOpen={true}
              widgetSize="small"
              greeting="Hi there! 👋 I'm so glad you reached out. Before we get started, can I get your first name?"
              agentName="Care Assist AI"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-4">Try it live — no signup needed</p>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="px-4 py-10 border-y border-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
            Trusted by leading treatment centers
          </p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-6 items-center justify-items-center">
            {trustedLogos.map((logo) => (
              <div
                key={logo.name}
                className="h-10 w-24 md:w-28 rounded-lg bg-muted flex items-center justify-center"
              >
                <Building2 className="w-5 h-5 text-muted-foreground/50" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VSL Section */}
      <section className="px-4 py-10 md:py-16">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-primary font-semibold text-sm uppercase tracking-wide mb-4">
            Step 1: Watch the short video
          </p>
          <div className="relative aspect-video bg-muted rounded-2xl border border-border overflow-hidden flex items-center justify-center">
            {/* VSL placeholder — replace with your video embed */}
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-3">
                <div className="w-0 h-0 border-l-[18px] border-l-primary border-y-[12px] border-y-transparent ml-1" />
              </div>
              <p className="text-muted-foreground text-sm">Your VSL video goes here</p>
            </div>
          </div>
          <div className="text-center mt-6">
            <Button
              onClick={handleCTA}
              size="lg"
              className="text-lg px-10 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all font-bold"
            >
              Start Free Trial <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="px-4 py-10 bg-accent">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl md:text-4xl font-extrabold text-primary">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="px-4 py-14 md:py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-extrabold text-center mb-4">
            Stop Wasting Ad Spend & Website Traffic
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            You're paying for clicks — but most visitors leave without converting. Here's what changes when an AI agent engages every single one.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow"
              >
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

      {/* How It Works */}
      <section className="px-4 py-14 md:py-20 bg-muted">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-extrabold mb-12">
            How It Works
          </h2>
          <div className="space-y-8 text-left">
            {[
              { step: '1', title: 'Paste One Line of Code', desc: 'Drop the widget onto your website or landing page. Works with any site builder — takes under 2 minutes.' },
              { step: '2', title: 'AI Converts Your Traffic', desc: 'Every visitor from Google Ads, Meta, or organic gets an instant, human-sounding conversation that captures their info.' },
              { step: '3', title: 'Leads Flow to Your Team', desc: 'Get notified via Slack, email, or Salesforce the moment a lead is captured. Full conversation context included.' },
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
          <div className="mt-12">
            <Button
              onClick={handleCTA}
              size="lg"
              className="text-lg px-10 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all font-bold"
            >
              Start Free Trial <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-14 md:py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-extrabold text-center mb-12">
            What Our Clients Say
          </h2>
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

      {/* Final CTA */}
      <section className="px-4 py-16 md:py-24 text-center bg-accent">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-extrabold mb-4">
            Ready to Turn Visitors Into Patients?
          </h2>
          <p className="text-muted-foreground mb-8">
            See how CareAssist works with a free, no-pressure demo tailored to your practice.
          </p>
          <Button
            onClick={handleCTA}
            size="lg"
            className="text-lg px-12 py-7 rounded-xl shadow-lg hover:shadow-xl transition-all font-bold"
          >
            Start Free Trial <ArrowRight className="w-5 h-5 ml-1" />
          </Button>
          <div className="flex items-center justify-center gap-6 mt-6 text-xs text-muted-foreground">
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
