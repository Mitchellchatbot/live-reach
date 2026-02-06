import { MessageSquare, Zap, Building2, LucideIcon } from 'lucide-react';

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  conversations: string;
  conversationsNum: number;
  icon: LucideIcon;
  popular?: boolean;
  features: string[];
  gradient: string;
  overflow?: string;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 199,
    description: 'Perfect for small treatment centers getting started with AI chat.',
    conversations: '500',
    conversationsNum: 500,
    icon: MessageSquare,
    gradient: 'from-blue-500 to-indigo-600',
    features: [
      '500 conversations/month',
      '1 property (website)',
      '1 AI persona',
      'Natural lead capture',
      'Email notifications',
      'Basic analytics',
      'Crisis detection',
      'Standard support',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 399,
    popular: true,
    description: 'For growing centers that need advanced AI and team collaboration.',
    conversations: '2,000',
    conversationsNum: 2000,
    icon: Zap,
    gradient: 'from-primary to-orange-500',
    features: [
      '2,000 conversations/month',
      '5 properties (websites)',
      'Unlimited AI personas',
      'Natural lead capture',
      'Email & Slack notifications',
      'Advanced analytics',
      'Crisis detection & escalation',
      'Salesforce integration',
      'Team members (up to 10)',
      'Custom AI prompts',
      'Priority support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 799,
    description: 'For large organizations with high volume and custom needs.',
    conversations: '10,000',
    conversationsNum: 10000,
    icon: Building2,
    gradient: 'from-violet-500 to-purple-600',
    overflow: 'Pay-as-you-go after 10,000 — $0.05 per extra conversation. Never miss a lead.',
    features: [
      '10,000 conversations/month',
      'Unlimited properties',
      'Unlimited AI personas',
      'Natural lead capture',
      'All notification channels',
      'Full analytics suite',
      'Crisis detection & escalation',
      'Salesforce integration',
      'Unlimited team members',
      'Custom AI prompts',
      'HIPAA BAA included',
      'Dedicated account manager',
      'Pay-as-you-go overflow',
      'API access',
    ],
  },
];

export const comparisonCategories = [
  {
    name: 'Usage',
    features: [
      { name: 'Monthly conversations', basic: '500', professional: '2,000', enterprise: '10,000+' },
      { name: 'Properties (websites)', basic: '1', professional: '5', enterprise: 'Unlimited' },
      { name: 'AI personas', basic: '1', professional: 'Unlimited', enterprise: 'Unlimited' },
      { name: 'Team members', basic: '1', professional: '10', enterprise: 'Unlimited' },
      { name: 'Overflow conversations', basic: false, professional: false, enterprise: 'Pay-as-you-go' },
    ],
  },
  {
    name: 'Features',
    features: [
      { name: 'Natural lead capture', basic: true, professional: true, enterprise: true },
      { name: 'Crisis detection', basic: true, professional: true, enterprise: true },
      { name: 'Custom AI prompts', basic: false, professional: true, enterprise: true },
      { name: 'Auto-escalation rules', basic: false, professional: true, enterprise: true },
      { name: 'Launcher effects', basic: false, professional: true, enterprise: true },
      { name: 'Proactive messages', basic: false, professional: true, enterprise: true },
    ],
  },
  {
    name: 'Integrations',
    features: [
      { name: 'Email notifications', basic: true, professional: true, enterprise: true },
      { name: 'Slack notifications', basic: false, professional: true, enterprise: true },
      { name: 'Salesforce CRM', basic: false, professional: true, enterprise: true },
      { name: 'API access', basic: false, professional: false, enterprise: true },
    ],
  },
  {
    name: 'Support & Compliance',
    features: [
      { name: 'Standard support', basic: true, professional: true, enterprise: true },
      { name: 'Priority support', basic: false, professional: true, enterprise: true },
      { name: 'Dedicated account manager', basic: false, professional: false, enterprise: true },
      { name: 'HIPAA BAA', basic: false, professional: false, enterprise: true },
    ],
  },
];
