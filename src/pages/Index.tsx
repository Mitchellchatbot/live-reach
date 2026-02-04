import { Link } from 'react-router-dom';
import { Zap, Shield, ArrowRight, Users, BarChart3, MessageSquare, CheckCircle2, Star, Heart, Clock, Bot, Phone, Brain, Sparkles, AlertTriangle, UserCheck, Smartphone, Settings, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatWidget } from '@/components/widget/ChatWidget';
import { useAuth } from '@/hooks/useAuth';
import scaledBotLogo from '@/assets/scaled-bot-logo.png';

const features = [
  {
    icon: Shield,
    title: 'Medical-Safe Responses',
    description: 'Tailored for behavioral health. Avoids unsafe responses that could create liability.',
  },
  {
    icon: AlertTriangle,
    title: 'Crisis Detection',
    description: 'Instantly detects crisis keywords and alerts your team for immediate human intervention.',
  },
  {
    icon: Brain,
    title: 'Natural Lead Capture',
    description: 'Collects visitor info through natural conversation—name, phone, insurance, and more.',
  },
  {
    icon: UserCheck,
    title: 'Qualified Handoffs',
    description: 'Human agents start conversations informed with full context and visitor details.',
  },
  {
    icon: BarChart3,
    title: 'Conversion Analytics',
    description: 'Track chat-to-lead conversion, drop-off points, and peak inquiry times.',
  },
  {
    icon: Zap,
    title: 'Salesforce Integration',
    description: 'Export captured leads directly to Salesforce with one click.',
  },
  {
    icon: Smartphone,
    title: 'Mobile Alerts',
    description: 'Get notified on your phone and respond to visitors from anywhere.',
  },
  {
    icon: Settings,
    title: 'Fully Customizable',
    description: 'Tailored to your facility\'s voice, services, and admission process.',
  },
  {
    icon: Lock,
    title: 'HIPAA Compliant',
    description: 'Secure handling of sensitive health information and visitor data.',
  },
];

const keyBenefits = [
  { icon: Clock, title: '24/7 Availability', desc: 'Never miss an inquiry' },
  { icon: Heart, title: 'Lead Retention', desc: 'Keep visitors engaged' },
  { icon: Shield, title: 'Risk Reduction', desc: 'Safe, compliant responses' },
  { icon: Users, title: 'Easy to Use', desc: 'Simple for your whole team' },
];

const testimonials = [
  {
    quote: "Response time dropped from 4 hours to 4 seconds. We're capturing leads we used to lose.",
    author: "Sarah M.",
    role: "Admissions Director",
    facility: "Recovery First Center",
    rating: 5,
  },
  {
    quote: "The AI handles after-hours inquiries with real empathy. Families feel heard immediately.",
    author: "Michael R.",
    role: "CEO",
    facility: "Serenity Treatment",
    rating: 5,
  },
  {
    quote: "Our admissions increased 47% in the first quarter. Game changer for our center.",
    author: "Jennifer L.",
    role: "Marketing Director",
    facility: "New Horizons Recovery",
    rating: 5,
  },
];

const FloatingBadge = ({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
  <div className={`absolute bg-card/95 backdrop-blur-sm rounded-2xl px-5 py-3 shadow-xl border border-border/50 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl ${className}`} style={style}>
    {children}
  </div>
);

const FloatingTestimonial = ({ testimonial, className, style }: { testimonial: typeof testimonials[0]; className?: string; style?: React.CSSProperties }) => (
  <div className={`absolute bg-card/95 backdrop-blur-md rounded-2xl p-5 shadow-xl border border-border/50 max-w-xs transform transition-all duration-500 hover:scale-105 hover:shadow-2xl ${className}`} style={style}>
    <div className="flex gap-0.5 mb-2">
      {[...Array(testimonial.rating)].map((_, i) => (
        <Star key={i} className="h-4 w-4 text-primary fill-primary" />
      ))}
    </div>
    <p className="text-sm text-foreground/90 mb-3 leading-relaxed italic">"{testimonial.quote}"</p>
    <div className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
        <span className="text-xs font-bold text-primary">{testimonial.author.split(' ').map(n => n[0]).join('')}</span>
      </div>
      <div>
        <p className="text-xs font-semibold text-foreground">{testimonial.author}</p>
        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
      </div>
    </div>
  </div>
);

const Index = () => {
  const { user, isAdmin, isAgent, signOut } = useAuth();
  
  const getDashboardRoute = () => {
    if (isAgent) return '/conversations';
    if (isAdmin) return '/admin';
    return '/dashboard';
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Subtle grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      
      {/* Navigation */}
      <nav className="relative border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src={scaledBotLogo} alt="Care Assist" className="h-10 w-10 rounded-xl shadow-sm" />
              <span className="font-bold text-xl tracking-tight text-foreground">Care Assist</span>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              <Button variant="ghost" className="font-medium text-muted-foreground hover:text-foreground">
                Integrations
              </Button>
              <Button variant="ghost" className="font-medium text-muted-foreground hover:text-foreground">
                Resources
              </Button>
              <Button variant="ghost" className="font-medium text-muted-foreground hover:text-foreground">
                Pricing
              </Button>
              <Button variant="ghost" className="font-medium text-muted-foreground hover:text-foreground">
                Contact
              </Button>
            </div>

            {/* Auth Actions */}
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <Link to={getDashboardRoute()}>
                    <Button variant="ghost" className="font-medium">Dashboard</Button>
                  </Link>
                  <Button variant="outline" onClick={signOut} className="font-medium">
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="ghost" className="font-medium">Login</Button>
                  </Link>
                  <Link to="/auth">
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 font-medium px-6">
                      Start Free
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero - Split Layout */}
      <section className="relative py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left - Chat Mockup */}
            <div className="relative order-2 lg:order-1">
              <div className="relative bg-card rounded-3xl shadow-2xl border border-border/50 overflow-hidden max-w-md mx-auto lg:mx-0">
                {/* Chat Header */}
                <div className="bg-primary px-5 py-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-primary-foreground font-semibold text-sm">Care Assist</p>
                    <p className="text-primary-foreground/70 text-xs">Online • Responds instantly</p>
                  </div>
                </div>
                
                {/* Chat Messages */}
                <div className="p-5 space-y-4 bg-muted/30 min-h-[320px]">
                  <div className="flex justify-start">
                    <div className="bg-card rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%] shadow-sm border border-border/50">
                      <p className="text-sm text-foreground">Hi! I'm here to help. Are you looking for treatment options for yourself or a loved one?</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                      <p className="text-sm">For my brother. He's struggling with addiction.</p>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-card rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%] shadow-sm border border-border/50">
                      <p className="text-sm text-foreground">I'm so glad you reached out. That takes courage. We have programs that can help. What's the best number to reach you?</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                      <p className="text-sm">555-123-4567</p>
                    </div>
                  </div>
                </div>
                
                {/* Chat Input */}
                <div className="p-4 border-t border-border/50 bg-card">
                  <div className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-3">
                    <span className="text-sm text-muted-foreground">Type a message...</span>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -z-10 -top-8 -left-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
              <div className="absolute -z-10 -bottom-8 -right-8 w-40 h-40 bg-primary/10 rounded-full blur-2xl" />
            </div>

            {/* Right - Content */}
            <div className="order-1 lg:order-2">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight">
                The AI chat for
                <span className="block">behavioral health</span>
                <span className="block text-primary">that converts.</span>
              </h1>
              
              {/* Checklist Benefits */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-status-online/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-status-online" />
                  </div>
                  <span className="text-lg text-foreground">Capture more leads 24/7</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-status-online/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-status-online" />
                  </div>
                  <span className="text-lg text-foreground">Respond in seconds, not hours</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-status-online/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-status-online" />
                  </div>
                  <span className="text-lg text-foreground">HIPAA compliant & crisis-aware</span>
                </div>
              </div>

              {/* Email Signup */}
              <div className="mt-10">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="email" 
                    placeholder="Enter your business email"
                    className="flex-1 h-14 px-5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <Link to="/auth">
                    <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-8 text-base font-semibold rounded-xl whitespace-nowrap">
                      Sign up free
                    </Button>
                  </Link>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Free 14-day trial • No credit card required
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logo Bar */}
      <section className="relative py-12 border-y border-border/50">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground mb-8">
            <span className="font-semibold text-foreground">100+ treatment centers</span> trust Care Assist to help more people find recovery
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-60">
            <span className="text-xl font-bold text-foreground/70">Recovery First</span>
            <span className="text-xl font-bold text-foreground/70">Serenity Health</span>
            <span className="text-xl font-bold text-foreground/70">New Horizons</span>
            <span className="text-xl font-bold text-foreground/70">Pathways</span>
            <span className="text-xl font-bold text-foreground/70">Clarity Center</span>
          </div>
        </div>
      </section>

      {/* Key Benefits Bar */}
      <section className="relative py-12 border-y border-border/50 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {keyBenefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{benefit.title}</p>
                  <p className="text-xs text-muted-foreground">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="relative py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Trusted by Leading Treatment Centers</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-card/80 backdrop-blur-sm p-6 rounded-2xl border border-border/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex gap-0.5 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-foreground/90 mb-4 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{testimonial.author.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{testimonial.author}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}, {testimonial.facility}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-2 rounded-full text-sm font-semibold mb-6">
                  <Clock className="h-4 w-4" />
                  The Problem
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 tracking-tight">
                  Every Minute Matters When Someone Reaches Out
                </h2>
                <div className="space-y-4 text-lg text-muted-foreground">
                  <p>
                    <span className="text-foreground font-semibold">78% of treatment inquiries</span> happen outside business hours—nights, weekends, holidays.
                  </p>
                  <p>
                    The average response time for addiction treatment inquiries is <span className="text-destructive font-semibold">4+ hours</span>. By then, the moment of motivation has passed.
                  </p>
                  <p>
                    Your admissions team can't be everywhere. But someone reaching out for help shouldn't have to wait.
                  </p>
                </div>
              </div>
              <div>
                <div className="inline-flex items-center gap-2 bg-status-online/10 text-status-online px-4 py-2 rounded-full text-sm font-semibold mb-6">
                  <Heart className="h-4 w-4" />
                  The Solution
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 tracking-tight">
                  Instant, Empathetic Response—Every Time
                </h2>
                <div className="space-y-4 text-lg text-muted-foreground">
                  <p>
                    Care Assist responds in <span className="text-status-online font-semibold">under 5 seconds</span> with warm, understanding conversation.
                  </p>
                  <p>
                    Our AI is trained on thousands of behavioral health conversations to engage with <span className="text-foreground font-semibold">genuine empathy</span>.
                  </p>
                  <p>
                    When visitors are ready, it seamlessly captures their info and alerts your team for follow-up.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Sparkles className="h-4 w-4" />
              Why Care Assist
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Built Different for
              <span className="text-primary"> Behavioral Health</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple, powerful features designed specifically for treatment centers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="group bg-card p-6 rounded-2xl border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors">
                    <feature.icon className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: '47%', label: 'Avg. Admission Increase' },
                { value: '<5s', label: 'Response Time' },
                { value: '24/7', label: 'Availability' },
                { value: '500+', label: 'Lives Impacted' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-primary/10 via-primary/15 to-primary/10 rounded-3xl p-12 md:p-16 border border-primary/20 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
            
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">
                Start Helping More People
                <span className="text-primary block mt-2">Today</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Join treatment centers across the country who are converting more leads and helping more people find recovery.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to={user ? getDashboardRoute() : '/auth'}>
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 gap-2 px-10 h-14 text-base font-semibold rounded-xl">
                    {user ? 'Go to Dashboard' : 'Start Free Trial'}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="gap-2 px-8 h-14 text-base font-semibold rounded-xl border-2">
                  <Phone className="h-5 w-5" />
                  Schedule Demo
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-6">No credit card required • Setup in 5 minutes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-border/50 py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <img src={scaledBotLogo} alt="Care Assist" className="h-9 w-9 rounded-xl" />
              <span className="font-semibold text-foreground">Care Assist</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Care Assist. Helping treatment centers help more people.
            </p>
            <div className="flex gap-6 text-sm">
              <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
              <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Demo Widget */}
      <ChatWidget />
    </div>
  );
};

export default Index;
