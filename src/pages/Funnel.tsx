import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, Star, Shield, Clock, Zap, Users, TrendingUp, MessageSquare } from 'lucide-react';
import sarahImg from '@/assets/testimonials/sarah.jpg';
import michaelImg from '@/assets/testimonials/michael.jpg';
import jenniferImg from '@/assets/testimonials/jennifer.jpg';

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
  { value: '3x', label: 'More leads captured' },
  { value: '24/7', label: 'Always-on coverage' },
  { value: '<5 min', label: 'Setup time' },
  { value: '93%', label: 'Visitor satisfaction' },
];

const Funnel = () => {
  const navigate = useNavigate();

  const handleCTA = () => navigate('/demo');

  return (
    <div className="min-h-screen bg-foreground text-background">
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
                  className="w-9 h-9 rounded-full border-2 border-foreground object-cover"
                />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center gap-1 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-primary text-primary" />
            ))}
          </div>
          <p className="text-sm text-background/60 mb-6">
            5.0 from 40+ treatment centers
          </p>

          {/* Target qualifier */}
          <p className="text-primary font-semibold text-base md:text-lg mb-4">
            For Treatment Centers & Healthcare Practices:
          </p>

          {/* Headline */}
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight mb-5">
            Turn Your Website Into a{' '}
            <span className="underline decoration-primary decoration-4 underline-offset-4">
              24/7 Lead-Generating Machine
            </span>{' '}
            — Without Hiring More Staff
          </h1>

          {/* Sub-headline */}
          <p className="text-lg md:text-xl text-background/70 mb-8 max-w-2xl mx-auto">
            Our AI chat agent captures <strong className="text-background">3x more leads</strong> from your existing traffic by engaging every visitor the moment they land — with conversations that feel genuinely human.
          </p>

          {/* CTA */}
          <Button
            onClick={handleCTA}
            size="lg"
            className="text-lg px-10 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all font-bold"
          >
            Get My Free Demo →
          </Button>
          <p className="text-xs text-background/40 mt-3">No credit card required · Live in 5 minutes</p>
        </div>
      </section>

      {/* VSL Section */}
      <section className="px-4 py-10 md:py-16">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-primary font-semibold text-sm uppercase tracking-wide mb-4">
            Step 1: Watch the short video
          </p>
          <div className="relative aspect-video bg-background/10 rounded-2xl border border-background/20 overflow-hidden flex items-center justify-center">
            {/* VSL placeholder — replace src with your video embed */}
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                <div className="w-0 h-0 border-l-[18px] border-l-primary border-y-[12px] border-y-transparent ml-1" />
              </div>
              <p className="text-background/50 text-sm">Your VSL video goes here</p>
            </div>
          </div>
          <div className="text-center mt-6">
            <Button
              onClick={handleCTA}
              size="lg"
              className="text-lg px-10 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all font-bold"
            >
              Get My Free Demo →
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="px-4 py-10 border-y border-background/10">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl md:text-4xl font-extrabold text-primary">{stat.value}</p>
              <p className="text-sm text-background/60 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="px-4 py-14 md:py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-extrabold text-center mb-4">
            Why Practices Are Switching to CareAssist
          </h2>
          <p className="text-center text-background/60 mb-12 max-w-2xl mx-auto">
            Stop losing leads to slow response times and missed chats. Here's what changes when you add an AI agent that never sleeps.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="bg-background/5 border border-background/10 rounded-2xl p-6 hover:bg-background/10 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center mb-4">
                  <b.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{b.title}</h3>
                <p className="text-background/60 text-sm leading-relaxed">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-14 md:py-20 bg-background/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-extrabold mb-12">
            How It Works
          </h2>
          <div className="space-y-8 text-left">
            {[
              { step: '1', title: 'Paste One Line of Code', desc: 'Drop the widget snippet onto your website. Takes less than 2 minutes.' },
              { step: '2', title: 'AI Engages Every Visitor', desc: 'Your branded AI agent greets visitors, answers questions, and naturally captures their info.' },
              { step: '3', title: 'Leads Flow to Your Team', desc: 'Get notified via Slack, email, or Salesforce. Full conversation context included.' },
            ].map((s) => (
              <div key={s.step} className="flex gap-5 items-start">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <span className="font-bold text-primary-foreground text-sm">{s.step}</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{s.title}</h3>
                  <p className="text-background/60 text-sm">{s.desc}</p>
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
              Get My Free Demo →
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
              <div key={t.name} className="bg-background/5 border border-background/10 rounded-2xl p-6">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-background/70 leading-relaxed mb-4">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.img} alt={t.name} className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-background/50">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-16 md:py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-extrabold mb-4">
            Ready to Turn Visitors Into Patients?
          </h2>
          <p className="text-background/60 mb-8">
            See how CareAssist works with a free, no-pressure demo tailored to your practice.
          </p>
          <Button
            onClick={handleCTA}
            size="lg"
            className="text-lg px-12 py-7 rounded-xl shadow-lg hover:shadow-xl transition-all font-bold"
          >
            Get My Free Demo →
          </Button>
          <div className="flex items-center justify-center gap-6 mt-6 text-xs text-background/40">
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
