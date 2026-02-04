import { Link } from 'react-router-dom';
import { Zap, Shield, Globe, ArrowRight, Code, Users, BarChart3, MessageSquare, CheckCircle2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatWidget } from '@/components/widget/ChatWidget';
import { useAuth } from '@/hooks/useAuth';
import scaledBotLogo from '@/assets/scaled-bot-logo.png';

const features = [
  {
    icon: Zap,
    title: 'Real-time Messaging',
    description: 'Instant communication with your website visitors using WebSocket technology.',
  },
  {
    icon: Users,
    title: 'Multi-Agent Support',
    description: 'Assign multiple agents to properties and manage team availability.',
  },
  {
    icon: Globe,
    title: 'Multi-Property',
    description: 'Manage chat widgets across multiple websites from one dashboard.',
  },
  {
    icon: Code,
    title: 'Easy Integration',
    description: 'Simple JavaScript snippet that works with any website or framework.',
  },
  {
    icon: Shield,
    title: 'Visitor Tracking',
    description: 'See visitor information, browsing history, and current page in real-time.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Ready',
    description: 'Built for future analytics, AI responses, and advanced features.',
  },
];

const FloatingBadge = ({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
  <div className={`absolute bg-white rounded-xl px-4 py-2 shadow-lg border border-border/50 transform transition-transform hover:scale-105 ${className}`} style={style}>
    {children}
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
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Link to={getDashboardRoute()}>
                    <Button variant="ghost" className="font-medium">Dashboard</Button>
                  </Link>
                  {isAdmin && (
                    <Link to="/admin">
                      <Button variant="ghost" className="font-medium">Admin</Button>
                    </Link>
                  )}
                  <Button variant="outline" onClick={signOut} className="font-medium">
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/widget-preview">
                    <Button variant="ghost" className="font-medium">Widget Demo</Button>
                  </Link>
                  <Link to="/auth">
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 font-medium px-6">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-24 lg:py-36">
        <div className="container mx-auto px-4">
          {/* Floating badges */}
          <FloatingBadge className="hidden lg:flex items-center gap-2 -left-4 top-32 -rotate-6 animate-fade-in">
            <CheckCircle2 className="h-4 w-4 text-status-online" />
            <span className="text-sm font-medium text-foreground">24/7 Support</span>
          </FloatingBadge>
          
          <FloatingBadge className="hidden lg:flex items-center gap-2 -right-4 top-24 rotate-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <Star className="h-4 w-4 text-status-away fill-status-away" />
            <span className="text-sm font-medium text-foreground">Trusted by 500+ teams</span>
          </FloatingBadge>
          
          <FloatingBadge className="hidden lg:flex items-center gap-2 left-12 bottom-16 rotate-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <MessageSquare className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">AI-Powered</span>
          </FloatingBadge>

          <div className="max-w-4xl mx-auto text-center relative">
            {/* Stats badge */}
            <div className="inline-flex items-center gap-2 bg-muted/80 backdrop-blur-sm border border-border/50 text-foreground px-5 py-2.5 rounded-full text-sm font-medium mb-8 shadow-sm">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span className="text-primary font-semibold">1M+</span>
              <span className="text-muted-foreground">Conversations Powered</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-[1.1] tracking-tight">
              Connect with your visitors
              <span className="block text-primary mt-2">in real-time.</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              A multi-tenant live chat system for your websites. Create properties, 
              assign agents, and start chatting with visitors <span className="text-foreground font-medium">instantly</span>.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={user ? getDashboardRoute() : '/auth'}>
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 gap-2 px-8 h-14 text-base font-semibold rounded-xl">
                  {user ? 'Open Dashboard' : 'Get Started Free'}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/widget-preview">
                <Button size="lg" variant="outline" className="gap-2 px-8 h-14 text-base font-semibold rounded-xl border-2 hover:bg-muted/50">
                  <Code className="h-5 w-5" />
                  View Widget Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Features */}
      <section className="relative py-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Zap className="h-4 w-4" />
              Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">Built for scale</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to provide exceptional customer support across all your properties.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="group bg-card/80 backdrop-blur-sm p-7 rounded-2xl border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Future Features */}
      <section className="relative py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-status-online/10 text-status-online px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <CheckCircle2 className="h-4 w-4" />
                Coming Soon
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">Ready for the future</h2>
              <p className="text-lg text-muted-foreground">
                Built with a modular architecture to support upcoming features.
              </p>
            </div>

            <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-8 shadow-lg">
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  'AI Auto-responses',
                  'User Analytics',
                  'Browser Events',
                  'File Upload',
                  'Departments',
                  'Triggers',
                  'WhatsApp Integration',
                  'And more...'
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                    <div className="h-2.5 w-2.5 rounded-full bg-primary/60" />
                    <span className="text-foreground font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-3xl p-12 border border-primary/10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
              Ready to transform your customer support?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start connecting with your visitors in real-time today.
            </p>
            <Link to={user ? getDashboardRoute() : '/auth'}>
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 gap-2 px-8 h-14 text-base font-semibold rounded-xl">
                {user ? 'Go to Dashboard' : 'Start Free Trial'}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
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
              © 2024 Care Assist. Internal tool for live customer support.
            </p>
          </div>
        </div>
      </footer>

      {/* Demo Widget */}
      <ChatWidget />
    </div>
  );
};

export default Index;
