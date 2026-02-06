import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Shield, ArrowRight, Users, BarChart3, MessageSquare, CheckCircle2, Star, Heart, Clock, Bot, Phone, Brain, Sparkles, AlertTriangle, UserCheck, Smartphone, Settings, Lock, Send, Play, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatWidget } from '@/components/widget/ChatWidget';
import { PricingSection } from '@/components/pricing/PricingSection';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import scaledBotLogo from '@/assets/scaled-bot-logo.png';

const features = [
  {
    icon: Shield,
    title: 'Medical-Safe Responses',
    description: 'Tailored for behavioral health. Avoids unsafe responses that could create liability.',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    icon: AlertTriangle,
    title: 'Crisis Detection',
    description: 'Instantly detects crisis keywords and alerts your team for immediate human intervention.',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    icon: Brain,
    title: 'Natural Lead Capture',
    description: 'Collects visitor info through natural conversation—name, phone, insurance, and more.',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    icon: UserCheck,
    title: 'Qualified Handoffs',
    description: 'Human agents start conversations informed with full context and visitor details.',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    icon: BarChart3,
    title: 'Conversion Analytics',
    description: 'Track chat-to-lead conversion, drop-off points, and peak inquiry times.',
    gradient: 'from-pink-500 to-rose-600',
  },
  {
    icon: Zap,
    title: 'Salesforce Integration',
    description: 'Export captured leads directly to Salesforce with one click.',
    gradient: 'from-cyan-500 to-blue-600',
  },
];

const testimonials = [
  {
    quote: "Response time dropped from 4 hours to 4 seconds. We're capturing leads we used to lose.",
    author: "Sarah M.",
    role: "Admissions Director",
    facility: "Recovery First Center",
    rating: 5,
    image: "SM",
  },
  {
    quote: "The AI handles after-hours inquiries with real empathy. Families feel heard immediately.",
    author: "Michael R.",
    role: "CEO",
    facility: "Serenity Treatment",
    rating: 5,
    image: "MR",
  },
  {
    quote: "Our admissions increased 47% in the first quarter. Game changer for our center.",
    author: "Jennifer L.",
    role: "Marketing Director",
    facility: "New Horizons Recovery",
    rating: 5,
    image: "JL",
  },
];

const stats = [
  { value: 47, suffix: '%', label: 'More Leads Captured', prefix: '+' },
  { value: 4, suffix: 's', label: 'Avg Response Time', prefix: '<' },
  { value: 24, suffix: '/7', label: 'Always Available', prefix: '' },
  { value: 100, suffix: '+', label: 'Treatment Centers', prefix: '' },
];

// Animated counter hook
const useCountUp = (end: number, duration: number = 2000, startOnView: boolean = true) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startOnView) {
      setHasStarted(true);
    }
  }, [startOnView]);

  useEffect(() => {
    if (startOnView && ref.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !hasStarted) {
            setHasStarted(true);
          }
        },
        { threshold: 0.5 }
      );
      observer.observe(ref.current);
      return () => observer.disconnect();
    }
  }, [startOnView, hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration, hasStarted]);

  return { count, ref };
};

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

// Stat counter component
const StatCounter = ({ value, suffix, label, prefix }: { value: number; suffix: string; label: string; prefix: string }) => {
  const { count, ref } = useCountUp(value, 2000);
  
  return (
    <div ref={ref} className="text-center group">
      <div className="text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-br from-primary via-primary to-primary/70 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-500 inline-block">
        {prefix}{count}{suffix}
      </div>
      <div className="text-sm md:text-base text-muted-foreground mt-3 font-semibold tracking-wide">
        {label}
      </div>
    </div>
  );
};

// Floating orb component
const FloatingOrb = ({ className, delay = 0 }: { className: string; delay?: number }) => (
  <div 
    className={`absolute rounded-full blur-3xl animate-float pointer-events-none ${className}`}
    style={{ animationDelay: `${delay}s` }}
  />
);

const navSections = [
  { id: 'features', label: 'Features' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'contact', label: 'Contact' },
];

const Index = () => {
  const { user, isAdmin, isAgent, signOut } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeSection, setActiveSection] = useState<string | null>(null);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Track which section is in view
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    navSections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const getDashboardRoute = () => {
    if (isAgent) return '/conversations';
    if (isAdmin) return '/admin';
    return '/dashboard';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Animated gradient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <FloatingOrb className="w-[600px] h-[600px] bg-primary/20 top-[-200px] right-[-200px]" delay={0} />
        <FloatingOrb className="w-[500px] h-[500px] bg-primary/15 bottom-[10%] left-[-150px]" delay={2} />
        <FloatingOrb className="w-[400px] h-[400px] bg-primary/10 top-[40%] right-[10%]" delay={4} />
        <FloatingOrb className="w-[300px] h-[300px] bg-accent/30 bottom-[-100px] right-[30%]" delay={1} />
      </div>
      
      {/* Subtle grid overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.15)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.15)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      
      {/* Mouse follow gradient */}
      <div 
        className="fixed w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl pointer-events-none transition-all duration-1000 ease-out"
        style={{ 
          left: mousePosition.x - 300, 
          top: mousePosition.y - 300,
          opacity: 0.5 
        }}
      />
      
      {/* Navigation */}
      <nav className="relative bg-background/60 backdrop-blur-2xl sticky top-0 z-50 border-b border-border/30">
        <div className="container mx-auto px-4">
          <div className="flex h-18 items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30">
                  <MessageSquare className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground">Care Assist</span>
            </div>
            
            {/* Center Navigation Links */}
             <div className="hidden lg:flex items-center gap-1 bg-muted/50 rounded-full px-2 py-1.5 backdrop-blur-sm border border-border/30">
              {navSections.map((section) => (
                <Button
                  key={section.id}
                  variant="ghost"
                  className={cn(
                    "font-medium rounded-full px-5 h-9 transition-all",
                    activeSection === section.id
                      ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => scrollTo(section.id)}
                >
                  {section.label}
                </Button>
              ))}
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
                    <Button variant="ghost" className="font-medium text-muted-foreground hover:text-foreground hidden sm:inline-flex">Login</Button>
                  </Link>
                  <Link to="/auth">
                    <Button className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25 font-semibold px-6 rounded-full h-10 group">
                      Start Free
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-28 lg:pb-40 overflow-hidden">
        <div className="container mx-auto px-4 relative">
          {/* Announcement Banner */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-primary/10 via-accent/50 to-primary/10 backdrop-blur-sm border border-primary/20 rounded-full pl-2 pr-5 py-1.5 text-sm font-medium text-foreground shadow-lg shadow-primary/5 animate-fade-in hover:scale-105 transition-transform cursor-pointer group">
              <span className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                NEW
              </span>
              <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                AI-powered crisis detection now available
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight">
                <span className="bg-gradient-to-br from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                  Never lose
                </span>
                <br />
                <span className="bg-gradient-to-r from-primary via-primary to-orange-500 bg-clip-text text-transparent animate-gradient-x">
                  another lead.
                </span>
              </h1>
              
              <p className="mt-8 text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                AI chat that engages visitors <span className="text-foreground font-semibold">24/7</span>, captures leads naturally, and alerts your team—staying <span className="text-primary font-semibold">HIPAA compliant</span>.
              </p>
              
              {/* Benefit Pills */}
              <div className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
                {[
                  { icon: Clock, text: '< 5 sec response' },
                  { icon: Shield, text: 'HIPAA compliant' },
                  { icon: Brain, text: 'AI-powered' },
                ].map((pill, i) => (
                  <div 
                    key={i}
                    className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-border/50 rounded-full px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:shadow-md hover:border-primary/30 transition-all animate-fade-in"
                    style={{ animationDelay: `${0.3 + i * 0.1}s` }}
                  >
                    <pill.icon className="h-4 w-4 text-primary" />
                    {pill.text}
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <Link to="/auth">
                  <Button size="lg" className="bg-gradient-to-r from-primary via-primary to-orange-500 text-primary-foreground hover:opacity-90 shadow-2xl shadow-primary/30 gap-2 px-8 h-14 text-lg font-bold rounded-2xl w-full sm:w-auto group transition-all duration-300 hover:shadow-3xl hover:shadow-primary/40 hover:-translate-y-1">
                    Start Free Trial
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/widget-preview">
                  <Button size="lg" variant="outline" className="gap-2 px-8 h-14 text-lg font-bold rounded-2xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 w-full sm:w-auto group transition-all duration-300 backdrop-blur-sm">
                    <Play className="h-5 w-5 group-hover:scale-110 transition-transform text-primary" />
                    Watch Demo
                  </Button>
                </Link>
              </div>
              
              <p className="mt-6 text-sm text-muted-foreground font-medium animate-fade-in flex items-center gap-4 justify-center lg:justify-start" style={{ animationDelay: '0.6s' }}>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Free 7-day trial
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  No credit card
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  5 min setup
                </span>
              </p>
            </div>

            {/* Right - Animated Chat Mockup */}
            <div className="relative order-first lg:order-last">
              {/* Floating badges */}
              <div className="absolute -top-6 left-4 lg:-left-8 bg-card/95 backdrop-blur-xl rounded-2xl px-4 py-3 shadow-2xl border border-green-500/30 z-20 animate-bounce-slow">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
                  <span className="text-sm font-bold text-green-600">Lead Captured!</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 left-8 lg:-left-4 bg-card/95 backdrop-blur-xl rounded-2xl px-4 py-3 shadow-2xl border border-primary/30 z-20 animate-fade-in" style={{ animationDelay: '2s' }}>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary animate-pulse" />
                  <span className="text-sm font-bold text-foreground">Avg. <span className="text-primary">4 sec</span> response</span>
                </div>
              </div>
              
              <div className="absolute top-1/3 -right-4 lg:-right-12 bg-gradient-to-r from-primary/20 to-primary/10 backdrop-blur-xl rounded-2xl px-3 py-2 shadow-xl border border-primary/30 z-20 animate-fade-in hidden md:block" style={{ animationDelay: '3s' }}>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                  <span className="text-xs font-bold text-primary">AI Powered</span>
                </div>
              </div>

              {/* Main chat mockup */}
              <div className="relative bg-card/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-border/50 overflow-hidden max-w-md mx-auto lg:mx-0 transform hover:scale-[1.02] transition-all duration-500 group">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative">
                  {/* Chat Header */}
                  <div className="bg-gradient-to-r from-primary via-primary to-orange-500 px-5 py-4 flex items-center justify-between relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    
                    <div className="flex items-center gap-3 relative">
                      <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center ring-2 ring-white/30 shadow-lg backdrop-blur-sm">
                        <Bot className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-base">Care Assist</p>
                        <div className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50" />
                          <p className="text-white/90 text-xs font-medium">Online • Responds instantly</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chat Messages */}
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
                        <CheckCircle2 className="h-4 w-4 text-green-500 animate-pulse" />
                        <span>Got it! Someone from our team will call you shortly.</span>
                      </span>
                    </AnimatedChatMessage>
                  </div>
                  
                  {/* Chat Input */}
                  <div className="p-4 border-t border-border/50 bg-card/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-3.5 border border-border/50 group-hover:border-primary/30 transition-colors">
                      <span className="text-sm text-muted-foreground flex-1 font-medium">Type a message...</span>
                      <div className="h-9 w-9 rounded-lg bg-gradient-to-r from-primary to-orange-500 flex items-center justify-center shadow-md shadow-primary/30">
                        <Send className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Background decorations */}
              <div className="absolute -z-10 -top-20 -left-20 w-72 h-72 bg-primary/25 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
              <div className="absolute -z-10 -bottom-20 -right-20 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Animated Stats Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/10 to-primary/5" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.08)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.08)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            {stats.map((stat, index) => (
              <StatCounter key={index} {...stat} />
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section id="testimonials" className="relative py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold mb-6 border border-primary/20">
              <Star className="h-4 w-4 fill-primary" />
              Trusted by 100+ Treatment Centers
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-4 tracking-tight">
              Real Results from
              <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent"> Real Centers</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="group relative bg-card/80 backdrop-blur-sm p-8 rounded-3xl border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
              >
                {/* Glow on hover */}
                <div className="absolute -inset-px bg-gradient-to-r from-primary/20 to-orange-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                
                <div className="relative">
                  <div className="flex gap-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-primary fill-primary" />
                    ))}
                  </div>
                  <p className="text-foreground text-lg leading-relaxed mb-8 font-medium">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-4 pt-6 border-t border-border/50">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center ring-4 ring-primary/20 shadow-lg">
                      <span className="text-base font-bold text-white">{testimonial.image}</span>
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-lg">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}, {testimonial.facility}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold mb-6 border border-primary/20">
              <Sparkles className="h-4 w-4" />
              Purpose-Built Features
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-4 tracking-tight">
              Built for
              <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent"> Behavioral Health</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Every feature designed with treatment centers in mind.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="group relative bg-card/60 backdrop-blur-sm p-8 rounded-3xl border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 overflow-hidden"
              >
                {/* Background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                <div className="relative">
                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="relative py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-red-500/10 to-transparent rounded-3xl blur-2xl" />
                <div className="relative bg-card/80 backdrop-blur-sm rounded-3xl p-10 border border-red-500/20 shadow-xl">
                  <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-600 px-4 py-2 rounded-full text-sm font-bold mb-6">
                    <Clock className="h-4 w-4" />
                    The Problem
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-6 tracking-tight">
                    Every Minute Matters
                  </h3>
                  <div className="space-y-4 text-lg text-muted-foreground">
                    <p>
                      <span className="text-foreground font-semibold">78% of treatment inquiries</span> happen outside business hours.
                    </p>
                    <p>
                      Average response time: <span className="text-red-500 font-bold text-2xl">4+ hours</span>
                    </p>
                    <p className="text-foreground/80">
                      By then, the moment of motivation has passed.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-green-500/10 to-transparent rounded-3xl blur-2xl" />
                <div className="relative bg-card/80 backdrop-blur-sm rounded-3xl p-10 border border-green-500/20 shadow-xl">
                  <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-600 px-4 py-2 rounded-full text-sm font-bold mb-6">
                    <Heart className="h-4 w-4" />
                    The Solution
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-6 tracking-tight">
                    Instant, Empathetic Response
                  </h3>
                  <div className="space-y-4 text-lg text-muted-foreground">
                    <p>
                      Care Assist responds in <span className="text-green-500 font-bold text-2xl">under 5 seconds</span>
                    </p>
                    <p>
                      Trained on <span className="text-foreground font-semibold">thousands of behavioral health conversations</span>
                    </p>
                    <p className="text-foreground/80">
                      Genuine empathy, every time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative py-32 overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-4 tracking-tight">
              Simple,
              <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent"> Transparent Pricing</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start with a 7-day free trial. No credit card required.
            </p>
          </div>
          <PricingSection showComparison={true} ctaPath="/auth" />
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/15 to-orange-500/10" />
        <FloatingOrb className="w-[500px] h-[500px] bg-primary/20 top-[-100px] left-[-100px]" delay={0} />
        <FloatingOrb className="w-[400px] h-[400px] bg-orange-500/15 bottom-[-100px] right-[-100px]" delay={2} />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6 tracking-tight">
              Start Helping More People
              <span className="block bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent mt-2">Today</span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join treatment centers across the country converting more leads and helping more people find recovery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={user ? getDashboardRoute() : '/auth'}>
                <Button size="lg" className="bg-gradient-to-r from-primary via-primary to-orange-500 text-primary-foreground hover:opacity-90 shadow-2xl shadow-primary/30 gap-2 px-10 h-16 text-lg font-bold rounded-2xl group">
                  {user ? 'Go to Dashboard' : 'Start 7-Day Free Trial'}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="gap-2 px-8 h-16 text-lg font-bold rounded-2xl border-2 hover:bg-background/80 backdrop-blur-sm">
                <Phone className="h-5 w-5" />
                Schedule Demo
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-8 font-medium">
              No credit card required • Setup in 5 minutes • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-border/50 py-12 bg-muted/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                <MessageSquare className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground">Care Assist</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Care Assist. Helping treatment centers help more people.
            </p>
            <div className="flex gap-6 text-sm">
              <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Privacy</Link>
              <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Terms</Link>
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
