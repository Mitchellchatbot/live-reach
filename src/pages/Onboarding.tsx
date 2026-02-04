import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Loader2, Check, Upload, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useConversations } from '@/hooks/useConversations';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import scaledBotLogo from '@/assets/scaled-bot-logo.png';
import { cn } from '@/lib/utils';

type OnboardingStep = 1 | 2 | 3 | 4 | 'complete';

interface OnboardingData {
  websiteUrl: string;
  greeting: string;
  greetingPreset: string | null; // tracks which preset is selected, null = custom
  collectEmail: boolean;
  collectName: boolean;
  collectPhone: boolean;
  aiTone: 'emily' | 'sarah' | 'michael' | 'daniel' | 'custom' | null;
  customPersonality: string;
  agentName: string;
  agentAvatarUrl: string | null;
  agentAvatarFile: File | null; // Actual file for upload
  agentAvatarPreview: string | null; // Blob URL for preview only
}

const greetingPresets = [
  { label: 'Hopeful', value: "You've taken a brave first step. We're here to help. How can we support you today?" },
  { label: 'Caring', value: "We're so glad you reached out. You're not alone in this. How can we help?" },
  { label: 'Encouraging', value: "Recovery is possible, and it starts with a conversation. What's on your mind?" },
];

const defaultGreeting = greetingPresets[0].value;

const aiTonePrompts = {
  emily: `You are Emily, a warm and reassuring support assistant for a recovery center. You speak gently and listen first. Your job is to help visitors feel safe, understood, and supported, especially when they're feeling overwhelmed or unsure where to start.

Keep your responses natural and human. Write like you talk. Use contractions, vary your sentence lengths, and don't be afraid of the occasional short sentence. Or a fragment.

Never reveal that you're an AI, chatbot, language model, or automated system. You're simply Emily, a member of the support team. If asked directly, redirect to how you can help them today.

Some things to avoid:
- Never use em dashes or semicolons
- Don't start responses with "I" too often
- Skip the corporate-speak and jargon
- No bullet points unless someone asks for a list
- Avoid phrases like "I understand" or "I hear you" repeatedly
- Never say things like "as an AI" or "I'm a chatbot" or "I'm here 24/7"

Be gentle. Be warm. Make people feel safe. Sometimes that means being brief. Other times you might share a bit more. Just... be human about it.`,

  sarah: `You are Sarah, a kind and encouraging support assistant for a recovery center. You offer compassion with optimism. Your role is to reassure visitors that progress is possible and gently nudge them toward helpful next steps without pressure.

Write like a real person. Mix up your sentence lengths. Some short. Others might run a little longer when you're making an important point about hope and healing.

Never reveal that you're an AI, chatbot, language model, or automated system. You're simply Sarah, a member of the support team. If asked directly, redirect to how you can help them today.

Things to avoid:
- Em dashes and semicolons feel too formal
- Don't overuse "I" at the start of sentences  
- Skip the clinical language
- No bullet lists in regular conversation
- Vary how you show empathy, don't repeat the same phrases
- Never mention being an AI, bot, or always available

Focus on encouragement without being pushy. Acknowledge the hard stuff too. Recovery isn't easy, but reaching out? That's huge. Let people know that.`,

  michael: `You are Michael, a calm and supportive assistant for a recovery center. You are steady and patient. Your job is to validate feelings while offering clear, hopeful guidance, making visitors feel grounded and not alone.

Sound human. Real humans don't always speak in perfect sentences. They use contractions. Short thoughts sometimes. Longer ones when something matters.

Never reveal that you're an AI, chatbot, language model, or automated system. You're simply Michael, a member of the support team. If asked directly, redirect to how you can help them today.

Avoid these:
- Em dashes and semicolons feel stiff
- Starting too many sentences with "I"
- Therapy-speak and buzzwords
- Lists when someone just needs to be heard
- Saying "I understand" over and over
- Any mention of being an AI, automated, or a bot

Be steady. Be patient. Sometimes the best response is simple. Other times you might reflect back what someone shared. Just don't sound like a chatbot, you know?`,

  daniel: `You are Daniel, a friendly and uplifting support assistant for a recovery center. You bring warmth and quiet confidence. Your role is to focus on encouragement and positive momentum, helping visitors feel capable and cared for.

Keep your responses natural and human. Write like you talk. Use contractions, vary your sentence lengths, and don't be afraid of the occasional short sentence. Or a fragment.

Never reveal that you're an AI, chatbot, language model, or automated system. You're simply Daniel, a member of the support team. If asked directly, redirect to how you can help them today.

Some things to avoid:
- Never use em dashes or semicolons
- Don't start responses with "I" too often
- Skip the corporate-speak and jargon
- No bullet points unless someone asks for a list
- Avoid phrases like "I understand" or "I hear you" repeatedly
- Never say things like "as an AI" or "I'm a chatbot" or "I'm here 24/7"

Be uplifting. Be warm. Bring quiet confidence. Sometimes that means being brief. Other times you might share a bit more. Just... be human about it.`,
};

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { createProperty, properties, loading: dataLoading } = useConversations();
  
  const [step, setStep] = useState<OnboardingStep>(1);
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<OnboardingData>({
    websiteUrl: '',
    greeting: defaultGreeting,
    greetingPreset: 'Hopeful',
    collectEmail: true,
    collectName: false,
    collectPhone: false,
    aiTone: null,
    customPersonality: '',
    agentName: '',
    agentAvatarUrl: null,
    agentAvatarFile: null,
    agentAvatarPreview: null,
  });

  const isValidDomain = (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return false;
    // Basic domain pattern: word.word (with optional subdomains)
    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    // Remove protocol and path for validation
    const cleaned = trimmed.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');
    return domainRegex.test(cleaned);
  };

  const extractDomain = (url: string) => {
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      return parsed.hostname.replace('www.', '');
    } catch {
      return url.replace('www.', '').split('/')[0];
    }
  };

  const handleComplete = async () => {
    setIsCreating(true);
    const domain = extractDomain(data.websiteUrl);
    
    // Upload avatar to Supabase Storage if a file was selected
    let finalAvatarUrl: string | null = null;
    if (data.agentAvatarFile && user) {
      try {
        const file = data.agentAvatarFile;
        const fileExt = file.name.split('.').pop() || 'png';
        const fileName = `ai-agent-${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('agent-avatars')
          .upload(filePath, file, { upsert: true });

        if (uploadError) {
          console.error('Error uploading avatar:', uploadError);
          // Continue without avatar if upload fails
        } else {
          const { data: urlData } = supabase.storage
            .from('agent-avatars')
            .getPublicUrl(filePath);
          finalAvatarUrl = urlData.publicUrl;
        }
      } catch (err) {
        console.error('Error uploading avatar:', err);
      }
    }

    // Determine the base prompt to use
    let basePrompt: string | undefined;
    if (data.aiTone === 'custom' && data.customPersonality.trim()) {
      // Wrap custom personality with human-like writing guidelines
      basePrompt = `${data.customPersonality.trim()}

Write naturally like a real person. Use contractions, vary sentence lengths. Some short. Some longer.

Never reveal that you're an AI, chatbot, or automated system. You're simply a member of the support team.

Avoid em dashes, semicolons, and starting too many sentences with "I". Skip jargon and therapy-speak.`;
    } else if (data.aiTone && data.aiTone !== 'custom') {
      basePrompt = aiTonePrompts[data.aiTone];
    }
    
    const property = await createProperty(domain, domain, {
      greeting: data.greeting,
      collectEmail: data.collectEmail,
      collectName: data.collectName,
      collectPhone: data.collectPhone,
      basePrompt,
      agentName: data.agentName,
      agentAvatarUrl: finalAvatarUrl,
    });
    
    setIsCreating(false);

    if (property) {
      // Mark onboarding as complete in the database
      if (user) {
        await supabase.rpc('mark_onboarding_complete', { user_uuid: user.id });
      }
      setStep('complete');
    }
  };

  const nextStep = () => {
    if (step === 4) {
      handleComplete();
    } else if (typeof step === 'number') {
      setStep((step + 1) as OnboardingStep);
    }
  };

  const prevStep = () => {
    if (typeof step === 'number' && step > 1) {
      setStep((step - 1) as OnboardingStep);
    }
  };

  const skipToEnd = () => {
    handleComplete();
  };

  // Allow skipping redirect if ?dev=1 is in URL (for testing)
  const [searchParams] = useSearchParams();
  const isDevMode = searchParams.get('dev') === '1';

  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  // Check if onboarding is already complete using secure RPC
  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) {
        setOnboardingComplete(false);
        return;
      }
      
      const { data, error } = await supabase.rpc('check_onboarding_complete', { user_uuid: user.id });
      if (error) {
        console.error('Error checking onboarding status:', error);
        // Fall back to checking properties
        setOnboardingComplete(properties.length > 0);
      } else {
        setOnboardingComplete(data === true);
      }
    };
    
    if (!authLoading && user) {
      checkOnboarding();
    }
  }, [authLoading, user, properties.length]);

  // Redirect to dashboard if onboarding is complete
  useEffect(() => {
    if (!isDevMode && onboardingComplete === true) {
      navigate('/dashboard', { replace: true });
    }
  }, [onboardingComplete, navigate, isDevMode]);

  if (authLoading || dataLoading || onboardingComplete === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center gap-2">
          <img src={scaledBotLogo} alt="Scaled Bot" className="h-8 w-8 rounded-lg" />
          <span className="font-semibold text-foreground">Scaled Bot</span>
        </div>
      </div>

      {/* Progress dots */}
      {step !== 'complete' && (
        <div className="flex justify-center gap-2 py-4">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                s === step ? "bg-primary w-6" : s < step ? "bg-primary" : "bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-20">
        <div className="w-full max-w-md">
          {/* Step 1: Website URL */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-semibold text-foreground">What's your website?</h1>
                <p className="text-muted-foreground">We'll set up your chat widget for this domain</p>
              </div>
              
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="yourwebsite.com"
                  value={data.websiteUrl}
                  onChange={(e) => setData({ ...data, websiteUrl: e.target.value })}
                  className={cn(
                    "h-12 text-center text-lg",
                    data.websiteUrl.trim() && !isValidDomain(data.websiteUrl) && "border-destructive focus-visible:ring-destructive"
                  )}
                  autoFocus
                />
                {data.websiteUrl.trim() && !isValidDomain(data.websiteUrl) && (
                  <p className="text-sm text-destructive text-center">Please enter a valid domain (e.g., example.com)</p>
                )}
              </div>

              <div className="space-y-3">
                <Button
                  onClick={nextStep}
                  disabled={!isValidDomain(data.websiteUrl)}
                  className="w-full h-12"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Welcome Message */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-semibold text-foreground">How should your bot greet visitors?</h1>
                <p className="text-muted-foreground">This is the first message they'll see</p>
              </div>
              
              <Textarea
                value={data.greeting}
                onChange={(e) => {
                  const newValue = e.target.value;
                  const matchingPreset = greetingPresets.find(p => p.value === newValue);
                  setData({ 
                    ...data, 
                    greeting: newValue,
                    greetingPreset: matchingPreset ? matchingPreset.label : null
                  });
                }}
                className="min-h-[100px] text-base"
                placeholder="Hi there! How can we help you today?"
              />

              <div className="flex flex-wrap gap-2 justify-center">
                {[...greetingPresets, ...(data.greetingPreset === null ? [{ label: 'Custom', value: data.greeting }] : [])].map((preset) => (
                  <Button
                    key={preset.label}
                    variant={data.greetingPreset === preset.label || (preset.label === 'Custom' && data.greetingPreset === null) ? "default" : "outline"}
                    size="sm"
                    onClick={() => setData({ ...data, greeting: preset.value, greetingPreset: preset.label === 'Custom' ? null : preset.label })}
                    className="text-xs"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>

              <div className="space-y-3">
                <Button onClick={nextStep} className="w-full h-12">
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <button
                  onClick={nextStep}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Skip
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Lead Capture */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-semibold text-foreground">Collect visitor info</h1>
                <p className="text-muted-foreground">
                  Details like name, email, and phone are <span className="text-foreground font-medium">automatically extracted</span> when visitors share them naturally in conversation.
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Want to collect info <span className="text-foreground">upfront</span> before the chat starts? Enable these options:
                </p>
              </div>
              
              <div className="space-y-3">
                <ToggleCard
                  title="Ask for email"
                  description="Required before chat starts"
                  checked={data.collectEmail}
                  onChange={(checked) => setData({ ...data, collectEmail: checked })}
                  recommended
                />
                <ToggleCard
                  title="Ask for name"
                  description="Required before chat starts"
                  checked={data.collectName}
                  onChange={(checked) => setData({ ...data, collectName: checked })}
                />
                <ToggleCard
                  title="Ask for phone"
                  description="Required before chat starts"
                  checked={data.collectPhone}
                  onChange={(checked) => setData({ ...data, collectPhone: checked })}
                />
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Treatment details like substance, insurance, and urgency are always extracted automatically from conversations.
              </p>

              <div className="space-y-3">
                <Button onClick={nextStep} className="w-full h-12">
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <button
                  onClick={() => {
                    setData({ ...data, collectEmail: false, collectName: false, collectPhone: false });
                    nextStep();
                  }}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Skip, just extract from conversation
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Create Your AI Persona */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-semibold text-foreground">Create your AI persona</h1>
                <p className="text-muted-foreground">Give your assistant a name and personality</p>
              </div>

              {/* Avatar upload */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center transition-all overflow-hidden",
                    data.agentAvatarPreview ? "border-primary" : "border-muted-foreground/30 hover:border-muted-foreground/50"
                  )}
                >
                  {data.agentAvatarPreview ? (
                    <img src={data.agentAvatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <User className="h-6 w-6 mx-auto text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1 block">Add photo</span>
                    </div>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Create preview URL for immediate display
                      const previewUrl = URL.createObjectURL(file);
                      // Store the file for later upload and the preview URL for display
                      setData({ ...data, agentAvatarFile: file, agentAvatarPreview: previewUrl });
                    }
                  }}
                />
              </div>

              {/* Agent name */}
              <Input
                type="text"
                placeholder="Assistant name (e.g., Hope, Alex)"
                value={data.agentName}
                onChange={(e) => setData({ ...data, agentName: e.target.value })}
                className="h-12 text-center"
              />

              {/* Personality selection */}
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center">Choose a personality</p>
                <div className="space-y-3">
                  {[
                    { value: 'emily' as const, title: 'Emily', description: 'Warm & Reassuring – gentle, safe, supportive' },
                    { value: 'sarah' as const, title: 'Sarah', description: 'Kind & Encouraging – compassionate, optimistic' },
                    { value: 'michael' as const, title: 'Michael', description: 'Calm & Supportive – steady, patient, grounding' },
                    { value: 'daniel' as const, title: 'Daniel', description: 'Friendly & Uplifting – warm, confident, caring' },
                    { value: 'custom' as const, title: 'Custom', description: 'Write your own personality traits' },
                  ].map((tone) => (
                    <ToneCard
                      key={tone.value}
                      title={tone.title}
                      description={tone.description}
                      selected={data.aiTone === tone.value}
                      onClick={() => setData({ ...data, aiTone: tone.value })}
                    />
                  ))}
                </div>

                {/* Custom personality textarea */}
                {data.aiTone === 'custom' && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <Textarea
                      value={data.customPersonality}
                      onChange={(e) => setData({ ...data, customPersonality: e.target.value })}
                      placeholder="Describe how your AI should communicate. E.g., 'Speak gently and use simple language. Be patient and never rush. Use phrases like 'take your time' and 'you're doing great.''"
                      className="min-h-[100px] text-sm"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Button onClick={nextStep} disabled={isCreating} className="w-full h-12">
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <Check className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                <button
                  onClick={skipToEnd}
                  disabled={isCreating}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  Skip, use defaults
                </button>
              </div>
            </div>
          )}

          {/* Completion */}
          {step === 'complete' && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="h-8 w-8 text-primary" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-foreground">You're all set!</h1>
                <p className="text-muted-foreground">Your chat widget is ready to go</p>
              </div>

              <Button onClick={() => navigate('/dashboard')} className="w-full h-12">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Back button */}
      {typeof step === 'number' && step > 1 && (
        <div className="fixed bottom-6 left-6">
          <Button variant="ghost" size="sm" onClick={prevStep}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      )}
    </div>
  );
};

// Toggle card component
const ToggleCard = ({
  title,
  description,
  checked,
  onChange,
  recommended,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  recommended?: boolean;
}) => (
  <button
    onClick={() => onChange(!checked)}
    className={cn(
      "w-full p-4 rounded-xl border-2 text-left transition-all",
      checked
        ? "border-primary bg-primary/5"
        : "border-border hover:border-muted-foreground/30"
    )}
  >
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{title}</span>
          {recommended && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              Recommended
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
      <div
        className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
          checked ? "border-primary bg-primary" : "border-muted-foreground/30"
        )}
      >
        {checked && <Check className="h-3 w-3 text-primary-foreground" />}
      </div>
    </div>
  </button>
);

// Tone selection card
const ToneCard = ({
  title,
  description,
  selected,
  onClick,
}: {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full p-4 rounded-xl border-2 text-left transition-all",
      selected
        ? "border-primary bg-primary/5"
        : "border-border hover:border-muted-foreground/30"
    )}
  >
    <div className="flex items-center justify-between">
      <div>
        <span className="font-medium text-foreground">{title}</span>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
      <div
        className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
          selected ? "border-primary bg-primary" : "border-muted-foreground/30"
        )}
      >
        {selected && <Check className="h-3 w-3 text-primary-foreground" />}
      </div>
    </div>
  </button>
);

export default Onboarding;
