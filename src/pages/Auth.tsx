import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import scaledBotLogo from '@/assets/scaled-bot-logo.png';
import { Eye, EyeOff } from 'lucide-react';

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
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  
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

  // Accept invitation for existing users after login
  const acceptInvitationForExistingUser = async (userId: string, userEmail: string) => {
    if (!inviteToken) return;

    // Find pending invitation matching this token and email
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id, email, invitation_expires_at')
      .eq('invitation_token', inviteToken)
      .eq('invitation_status', 'pending')
      .eq('email', userEmail)
      .maybeSingle();

    if (agentError || !agent) {
      console.log('No matching pending invitation found');
      return;
    }

    // Check if expired
    if (agent.invitation_expires_at && new Date(agent.invitation_expires_at) < new Date()) {
      toast({
        title: 'Invitation Expired',
        description: 'This invitation has expired. Please ask for a new one.',
        variant: 'destructive',
      });
      return;
    }

    // Update agent record to link user and mark accepted
    const { error: updateError } = await supabase
      .from('agents')
      .update({
        user_id: userId,
        invitation_status: 'accepted',
        invitation_token: null,
        invitation_expires_at: null,
      })
      .eq('id', agent.id);

    if (updateError) {
      console.error('Error accepting invitation:', updateError);
      return;
    }

    // Add agent role
    await supabase
      .from('user_roles')
      .upsert({ user_id: userId, role: 'agent' }, { onConflict: 'user_id' });

    toast({
      title: 'Welcome to the team!',
      description: 'You have successfully joined as an agent.',
    });
  };

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
    
    if (error) {
      setIsLoading(false);
      toast({
        title: 'Login Failed',
        description: error.message === 'Invalid login credentials' 
          ? 'Invalid email or password. Please try again.'
          : error.message,
        variant: 'destructive',
      });
      return;
    }

    // If logging in with an invite token, accept the invitation
    if (inviteToken) {
      const { data: { user: loggedInUser } } = await supabase.auth.getUser();
      if (loggedInUser) {
        await acceptInvitationForExistingUser(loggedInUser.id, loggedInUser.email || loginEmail);
      }
    }

    setIsLoading(false);
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
      // Send welcome email (fire and forget – don't block signup)
      supabase.functions.invoke('send-welcome-email', {
        body: { email: signupEmail, fullName: signupName },
      }).then(({ error: emailError }) => {
        if (emailError) {
          console.error('Welcome email failed:', emailError);
        }
      });

      toast({
        title: 'Account Created',
        description: invitationData 
          ? 'Welcome to the team! Redirecting to your dashboard...'
          : 'You can now access your dashboard.',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/30 to-muted/50">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-muted" />
            <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/20 to-primary/5 p-4 sm:p-6">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/[0.04] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-0 w-[300px] h-[300px] bg-primary/[0.03] rounded-full blur-3xl" />
      </div>
      
      <div className="w-full max-w-[420px] page-enter">
        {/* Logo + header outside card */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3.5 bg-primary/10 rounded-2xl mb-5 shadow-sm">
            <img src={scaledBotLogo} alt="Care Assist" className="h-12 w-auto" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {invitationData ? 'Accept Your Invitation' : 'Welcome to Care Assist'}
          </h1>
          <p className="text-muted-foreground mt-2 text-base">
            {invitationData ? (
              <>
                <span className="font-medium text-foreground">{invitationData.inviterName}</span> invited you to join as an agent
              </>
            ) : (
              'Compassionate support, one conversation at a time'
            )}
          </p>
        </div>

        <Card className="border-border/30 shadow-2xl shadow-primary/[0.06] backdrop-blur-sm bg-card rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="px-6 pt-6">
                <TabsList className="grid w-full grid-cols-2 h-11 rounded-xl bg-muted/50 p-1">
                  <TabsTrigger value="login" className="rounded-lg text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground transition-all duration-200">
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-lg text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground transition-all duration-200">
                    Sign Up
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="px-6 pb-6 pt-5">
                <TabsContent value="login" className="mt-0 animate-fade-in">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="login-email" className="text-sm font-medium text-foreground/80">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        className="h-11 rounded-xl border-border/50 bg-muted/30 focus:bg-card focus:border-primary/40 transition-all placeholder:text-muted-foreground/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="login-password" className="text-sm font-medium text-foreground/80">Password</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showLoginPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                          className="h-11 rounded-xl border-border/50 bg-muted/30 focus:bg-card focus:border-primary/40 transition-all pr-11 placeholder:text-muted-foreground/50"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted/50 rounded-lg"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                        >
                          {showLoginPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-11 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 mt-1" 
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
                
                <TabsContent value="signup" className="mt-0 animate-fade-in">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="signup-name" className="text-sm font-medium text-foreground/80">Full Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Your name"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        required
                        disabled={!!invitationData}
                        className="h-11 rounded-xl border-border/50 bg-muted/30 focus:bg-card focus:border-primary/40 transition-all disabled:bg-muted placeholder:text-muted-foreground/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="signup-email" className="text-sm font-medium text-foreground/80">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                        disabled={!!invitationData}
                        className="h-11 rounded-xl border-border/50 bg-muted/30 focus:bg-card focus:border-primary/40 transition-all disabled:bg-muted placeholder:text-muted-foreground/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="signup-password" className="text-sm font-medium text-foreground/80">Password</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showSignupPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          required
                          className="h-11 rounded-xl border-border/50 bg-muted/30 focus:bg-card focus:border-primary/40 transition-all pr-11 placeholder:text-muted-foreground/50"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted/50 rounded-lg"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                        >
                          {showSignupPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-11 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 mt-1" 
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
              </div>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground/70 mt-6">
          {invitationData 
            ? 'Create your account to start helping visitors'
            : 'Your journey to healing starts here'
          }
        </p>
      </div>
    </div>
  );
}
