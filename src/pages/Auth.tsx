import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import scaledBotLogo from '@/assets/scaled-bot-logo.png';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

interface InvitationData {
  agentName: string;
  agentEmail: string;
  inviterName: string;
  isExpired: boolean;
}

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
  const [activeTab, setActiveTab] = useState('login');
  
  const { signIn, signUp, user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const inviteToken = searchParams.get('invite');

  // Fetch invitation data if token exists
  useEffect(() => {
    const fetchInvitation = async () => {
      if (!inviteToken) return;

      const { data: agent, error } = await supabase
        .from('agents')
        .select('name, email, invitation_expires_at, invited_by')
        .eq('invitation_token', inviteToken)
        .eq('invitation_status', 'pending')
        .maybeSingle();

      if (error || !agent) {
        toast({
          title: 'Invalid Invitation',
          description: 'This invitation link is invalid or has already been used.',
          variant: 'destructive',
        });
        return;
      }

      // Check if expired
      const isExpired = agent.invitation_expires_at 
        ? new Date(agent.invitation_expires_at) < new Date()
        : false;

      if (isExpired) {
        toast({
          title: 'Invitation Expired',
          description: 'This invitation has expired. Please ask for a new one.',
          variant: 'destructive',
        });
      }

      // Fetch inviter name
      const { data: inviterProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', agent.invited_by)
        .maybeSingle();

      setInvitationData({
        agentName: agent.name,
        agentEmail: agent.email,
        inviterName: inviterProfile?.full_name || 'A team member',
        isExpired,
      });

      // Pre-fill signup form
      setSignupName(agent.name);
      setSignupEmail(agent.email);
      setActiveTab('signup');
    };

    fetchInvitation();
  }, [inviteToken, toast]);

  // Redirect based on role after login
  useEffect(() => {
    if (loading) return;
    
    if (user && role) {
      if (role === 'agent') {
        navigate('/conversations');
      } else if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, role, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!result.success) {
      toast({
        title: 'Validation Error',
        description: result.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsLoading(false);

    if (error) {
      toast({
        title: 'Login Failed',
        description: error.message === 'Invalid login credentials' 
          ? 'Invalid email or password. Please try again.'
          : error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = signupSchema.safeParse({ 
      fullName: signupName, 
      email: signupEmail, 
      password: signupPassword 
    });
    if (!result.success) {
      toast({
        title: 'Validation Error',
        description: result.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    if (invitationData?.isExpired) {
      toast({
        title: 'Invitation Expired',
        description: 'Please ask for a new invitation.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, signupName);
    setIsLoading(false);

    if (error) {
      const errorMessage = error.message.includes('already registered')
        ? 'This email is already registered. Please login instead.'
        : error.message;
      
      toast({
        title: 'Signup Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Account Created',
        description: invitationData 
          ? 'Welcome to the team! Redirecting to your dashboard...'
          : 'You can now access your dashboard.',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/30 to-muted/50 p-6">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/30 rounded-full blur-3xl" />
      </div>
      
      <Card className="w-full max-w-md border-border/40 shadow-xl backdrop-blur-sm bg-card/95 rounded-2xl animate-fade-in">
        <CardHeader className="text-center space-y-6 pt-8 pb-4">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <img src={scaledBotLogo} alt="Scaled Bot" className="h-14 w-auto" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              {invitationData ? 'Accept Your Invitation' : 'Welcome to Scaled Bot'}
            </CardTitle>
            <CardDescription className="text-muted-foreground/80 text-base leading-relaxed">
              {invitationData ? (
                <>
                  <span className="font-medium text-foreground">{invitationData.inviterName}</span> invited you to join as an agent
                </>
              ) : (
                'Compassionate support, one conversation at a time'
              )}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 h-12 rounded-xl bg-muted/60">
              <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all duration-300">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all duration-300">
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="animate-fade-in">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="h-12 rounded-xl border-border/60 focus:border-primary/50 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="h-12 rounded-xl border-border/60 focus:border-primary/50 transition-colors"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl text-base font-medium shadow-md hover:shadow-lg transition-all duration-300 mt-2" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="animate-fade-in">
              <form onSubmit={handleSignup} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-sm font-medium">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Your name"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                    disabled={!!invitationData}
                    className="h-12 rounded-xl border-border/60 focus:border-primary/50 transition-colors disabled:bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    disabled={!!invitationData}
                    className="h-12 rounded-xl border-border/60 focus:border-primary/50 transition-colors disabled:bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    className="h-12 rounded-xl border-border/60 focus:border-primary/50 transition-colors"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl text-base font-medium shadow-md hover:shadow-lg transition-all duration-300 mt-2" 
                  disabled={isLoading || invitationData?.isExpired}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Creating account...
                    </span>
                  ) : invitationData ? 'Join Team' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <p className="text-center text-sm text-muted-foreground mt-8">
            {invitationData 
              ? 'Create your account to start helping visitors'
              : 'Your journey to healing starts here'
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
