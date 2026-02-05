import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Shield, ArrowRight, Users, BarChart3, MessageSquare, CheckCircle2, Star, Heart, Clock, Bot, Phone, Brain, Sparkles, AlertTriangle, UserCheck, Smartphone, Settings, Lock, Send } from 'lucide-react';
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

// Typing indicator component
const TypingIndicator = ({ visible }: { visible: boolean }) => {
  if (!visible) return null;
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="bg-card rounded-2xl rounded-tl-sm shadow-sm border border-border/50 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary/60 typing-dot" />
          <span className="h-2 w-2 rounded-full bg-primary/60 typing-dot" />
          <span className="h-2 w-2 rounded-full bg-primary/60 typing-dot" />
        </div>
      </div>
    </div>
  );
};

// Animated chat message component with typing
const AnimatedChatMessage = ({ children, delay, isBot }: { children: React.ReactNode; delay: number; isBot: boolean }) => {
  const [showTyping, setShowTyping] = useState(false);
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    if (isBot) {
      const typingTimer = setTimeout(() => setShowTyping(true), (delay - 0.8) * 1000);
      const messageTimer = setTimeout(() => {
        setShowTyping(false);
        setVisible(true);
      }, delay * 1000);
      return () => {
        clearTimeout(typingTimer);
        clearTimeout(messageTimer);
      };
    } else {
      const timer = setTimeout(() => setVisible(true), delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [delay, isBot]);
  
  if (isBot && showTyping) return <TypingIndicator visible />;
  if (!visible) return null;
  
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} animate-scale-in`}>
      <div className={`${isBot 
        ? 'bg-card rounded-2xl rounded-tl-sm shadow-md border border-border/50' 
        : 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-2xl rounded-tr-sm shadow-lg shadow-primary/20'
      } px-4 py-3 max-w-[85%] transform transition-all duration-300 hover:scale-[1.02]`}>
        <p className={`text-sm font-medium ${isBot ? 'text-foreground' : ''}`}>{children}</p>
      </div>
    </div>
  );
};

const Index = () => {
  const { user, isAdmin, isAgent, signOut } = useAuth();
  
  const getDashboardRoute = () => {
    if (isAgent) return '/conversations';
    if (isAdmin) return '/admin';
    return '/dashboard';
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden page-enter">
      {/* Subtle grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      
      {/* Navigation */}
      <nav className="relative bg-background/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <span className="font-bold text-xl tracking-tight text-foreground">Care Assist</span>
            </div>
            
            {/* Center Navigation Links */}
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

            {/* Right Auth Actions */}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Link to={getDashboardRoute()}>
                    <Button variant="ghost" className="font-medium text-foreground">Dashboard</Button>
                  </Link>
                  <Button variant="outline" onClick={signOut} className="font-medium rounded-full px-5">
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="ghost" className="font-medium text-muted-foreground hover:text-foreground">Login</Button>
                  </Link>
                  <Link to="/auth">
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 font-semibold px-6 rounded-full">
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
      <section className="relative py-16 lg:py-24 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left - Animated Chat Mockup */}
            <div className="relative order-2 lg:order-1">
              {/* Floating stat badges with bounce animation */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-br from-card to-card/95 rounded-2xl px-4 py-3 shadow-xl border border-status-online/30 animate-fade-in z-10 hover:scale-105 transition-transform">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-status-online animate-pulse shadow-md shadow-status-online/50" />
                  <span className="text-sm font-bold text-status-online">Lead Captured!</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-gradient-to-br from-card to-card/95 rounded-2xl px-4 py-3 shadow-xl border border-primary/30 animate-fade-in z-10 hover:scale-105 transition-transform" style={{ animationDelay: '2s' }}>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary animate-pulse" />
                  <span className="text-sm font-bold text-foreground">Avg. <span className="text-primary">4 sec</span> response</span>
                </div>
              </div>
              
              {/* New floating badge */}
              <div className="absolute top-1/2 -right-8 lg:-right-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl px-3 py-2 shadow-lg border border-primary/20 animate-fade-in z-10 hidden lg:block" style={{ animationDelay: '3s' }}>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                  <span className="text-xs font-bold text-primary">AI Powered</span>
                </div>
              </div>

              <div className="relative bg-card rounded-3xl shadow-2xl border border-border overflow-hidden max-w-md mx-auto lg:mx-0 transform hover:scale-[1.02] hover:shadow-3xl transition-all duration-500 group">
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-primary via-primary to-primary/90 px-5 py-4 flex items-center justify-between relative overflow-hidden">
                  {/* Animated gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  
                  <div className="flex items-center gap-3 relative">
                    <div className="h-12 w-12 rounded-full bg-primary-foreground/20 flex items-center justify-center ring-2 ring-primary-foreground/30 shadow-lg">
                      <Bot className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-primary-foreground font-bold text-base">Care Assist</p>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-status-online animate-pulse shadow-md shadow-status-online/50" />
                        <p className="text-primary-foreground/90 text-xs font-medium">Online • Responds instantly</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Chat Messages - Animated */}
                <div className="p-5 space-y-4 bg-gradient-to-b from-muted/10 via-muted/20 to-muted/30 min-h-[360px]">
                  <AnimatedChatMessage delay={0.5} isBot>
                    Hi! I'm here to help. Are you looking for treatment options for yourself or a loved one?
                  </AnimatedChatMessage>
                  
                  <AnimatedChatMessage delay={2.5} isBot={false}>
                    For my brother. He's struggling with addiction.
                  </AnimatedChatMessage>
                  
                  <AnimatedChatMessage delay={4.5} isBot>
                    I'm so glad you reached out. That takes courage. We have programs that can help. What's the best number to reach you?
                  </AnimatedChatMessage>
                  
                  <AnimatedChatMessage delay={6.5} isBot={false}>
                    555-123-4567
                  </AnimatedChatMessage>
                  
                  <AnimatedChatMessage delay={8.5} isBot>
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-status-online animate-pulse" />
                      <span>Got it! Someone from our team will call you shortly.</span>
                    </span>
                  </AnimatedChatMessage>
                </div>
                
                {/* Chat Input */}
                <div className="p-4 border-t border-border bg-card relative">
                  <div className="flex items-center gap-3 bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl px-4 py-3.5 border border-border/50 group-hover:border-primary/30 transition-colors">
                    <span className="text-sm text-muted-foreground flex-1 font-medium">Type a message...</span>
                    <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/30 group-hover:shadow-lg group-hover:shadow-primary/40 transition-shadow">
                      <Send className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements - more vibrant */}
              <div className="absolute -z-10 -top-20 -left-20 w-56 h-56 bg-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
              <div className="absolute -z-10 -bottom-20 -right-20 w-64 h-64 bg-primary/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
            </div>

            {/* Right - Content */}
            <div className="order-1 lg:order-2">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/15 to-primary/5 text-primary px-5 py-2.5 rounded-full text-sm font-bold mb-6 border border-primary/20 shadow-sm animate-fade-in">
                <Sparkles className="h-4 w-4 animate-pulse" />
                AI-Powered for Behavioral Health
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.08] tracking-tight">
                <span className="bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">Never lose another</span>
                <span className="block bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent mt-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>lead to slow response.</span>
              </h1>
              
              <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg font-medium">
                AI chat that engages treatment seekers <span className="text-foreground font-semibold">24/7</span>, captures their info naturally, and alerts your team—all while staying <span className="text-primary font-semibold">HIPAA compliant</span>.
              </p>
              
              {/* Checklist Benefits */}
              <div className="mt-8 space-y-4">
                {[
                  { text: 'Capture 47% more leads', highlight: '47% more' },
                  { text: 'Respond in seconds, not hours', highlight: 'seconds' },
                  { text: 'Crisis detection & instant escalation', highlight: 'Crisis detection' },
                  { text: 'HIPAA compliant & medically safe', highlight: 'HIPAA compliant' }
                ].map((benefit, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-3 animate-fade-in group cursor-default" 
                    style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                  >
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-status-online to-status-online/80 flex items-center justify-center flex-shrink-0 shadow-md shadow-status-online/30 group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-foreground font-semibold text-base group-hover:text-primary transition-colors">{benefit.text}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <Link to="/auth">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/95 hover:to-primary/85 shadow-xl shadow-primary/30 gap-2 px-8 h-14 text-base font-bold rounded-xl w-full sm:w-auto group transition-all duration-300 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-0.5">
                    Start Free Trial
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/widget-preview">
                  <Button size="lg" variant="outline" className="gap-2 px-8 h-14 text-base font-bold rounded-xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 w-full sm:w-auto group transition-all duration-300">
                    <MessageSquare className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    See Demo
                  </Button>
                </Link>
              </div>
              
              <p className="mt-5 text-sm text-muted-foreground font-medium animate-fade-in" style={{ animationDelay: '0.7s' }}>
                ✓ Free 14-day trial &nbsp;•&nbsp; ✓ No credit card &nbsp;•&nbsp; ✓ 5 min setup
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar - Light gradient */}
      <section className="relative py-16 bg-gradient-to-br from-primary/10 via-primary/5 to-background overflow-hidden border-y border-primary/10">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.08)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.08)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
        
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '47%', label: 'More leads captured' },
              { value: '<5s', label: 'Response time' },
              { value: '24/7', label: 'Always available' },
              { value: '100+', label: 'Treatment centers' },
            ].map((stat, index) => (
              <div key={index} className="group cursor-default">
                <div className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary group-hover:scale-105 transition-transform duration-300 inline-block">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-2 font-semibold">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Benefits Bar */}
      <section className="relative py-14 border-b border-border/50 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {keyBenefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-4 group cursor-default">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <benefit.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{benefit.title}</p>
                  <p className="text-xs text-muted-foreground">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="relative py-20 bg-muted/30">
        {/* Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.4)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.4)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Trusted by Leading Treatment Centers</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-card p-8 rounded-2xl border border-border/50 hover:shadow-xl hover:border-primary/20 transition-all duration-300 group"
              >
                <div className="flex gap-1 mb-5">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-foreground text-base leading-relaxed mb-6 font-medium">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                  <div className="h-11 w-11 rounded-full bg-primary/15 flex items-center justify-center ring-2 ring-primary/20">
                    <span className="text-sm font-bold text-primary">{testimonial.author.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{testimonial.author}</p>
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
