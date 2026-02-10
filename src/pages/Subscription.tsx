import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { useAuth } from '@/hooks/useAuth';
import { useConversations } from '@/hooks/useConversations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CreditCard, Calendar, MessageSquare, ArrowRight, TrendingUp, AlertCircle, ArrowUpRight, ArrowDownRight, Receipt, XCircle, Settings, Building2, Plus } from 'lucide-react';
import { PricingSection } from '@/components/pricing/PricingSection';
import { pricingPlans } from '@/components/pricing/PricingData';
import { cn } from '@/lib/utils';

const Subscription = () => {
  const { user } = useAuth();
  const { properties } = useConversations();
  const [searchParams] = useSearchParams();
  const isAddPropertyIntent = searchParams.get('reason') === 'add-property';

  // Mock subscription state – will be replaced by Stripe data
  const [currentPlan] = useState<string | null>(null); // null = no active plan (trial)
  const trialDaysLeft = 7;
  const conversationsUsed = 0;

  const activePlan = pricingPlans.find(p => p.id === currentPlan);
  const conversationLimit = activePlan?.conversationsNum || 500;
  const usagePercent = Math.min((conversationsUsed / conversationLimit) * 100, 100);

  return (
    <DashboardLayout className="bg-background">
      <div className="flex-1 flex flex-col overflow-y-auto">
        <PageHeader
          title="Subscription"
        />

        <div className="flex-1 p-3 md:p-6 space-y-4 md:space-y-8 max-w-6xl mx-auto w-full">
          {/* Add Property Paywall Banner */}
          {isAddPropertyIntent && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="flex items-center gap-4 py-5">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-lg">Add Another Property</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                  Your first property is free. Each additional property is <span className="font-bold text-foreground">$97/month</span>.
                    Choose a plan below or connect payments to get started.
                  </p>
                </div>
                <Badge variant="outline" className="border-primary text-primary bg-primary/10 shrink-0 text-sm px-3 py-1">
                  $97/property
                </Badge>
              </CardContent>
            </Card>
          )}

          {/* Current Plan Status */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Plan Card */}
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      Current Plan
                    </CardTitle>
                    <CardDescription>
                      {currentPlan
                        ? `You\u2019re on the ${activePlan?.name} plan`
                        : "You\u2019re currently on a free trial"}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-sm font-semibold",
                      currentPlan
                        ? "border-primary text-primary bg-primary/10"
                        : "border-amber-500 text-amber-600 bg-amber-500/10"
                    )}
                  >
                    {currentPlan ? activePlan?.name : 'Free Trial'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {!currentPlan && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {trialDaysLeft} days left in your free trial
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Choose a plan below to continue using Care Assist after your trial ends.
                      </p>
                    </div>
                  </div>
                )}

                {currentPlan && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                      <p className="text-xs text-muted-foreground font-medium">Monthly Price</p>
                      <p className="text-2xl font-bold text-foreground mt-1">${activePlan?.price}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                      <p className="text-xs text-muted-foreground font-medium">Next Billing Date</p>
                      <p className="text-lg font-semibold text-foreground mt-1 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        —
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                      <p className="text-xs text-muted-foreground font-medium">Status</p>
                      <Badge className="mt-2 bg-green-100 text-green-700 border-green-200">Active</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Usage Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Usage
                </CardTitle>
                <CardDescription>Conversations this month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{conversationsUsed.toLocaleString()} used</span>
                    <span className="font-medium text-foreground">{conversationLimit.toLocaleString()} limit</span>
                  </div>
                  <Progress value={usagePercent} className="h-3" />
                </div>
                <p className="text-xs text-muted-foreground">
                  {conversationLimit - conversationsUsed > 0
                    ? `${(conversationLimit - conversationsUsed).toLocaleString()} conversations remaining`
                    : 'Limit reached — upgrade for more'}
                </p>
                {activePlan?.overflow && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      Pay-as-you-go active — $0.05/extra conversation
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Manage Plan Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Manage Plan
              </CardTitle>
              <CardDescription>
                {currentPlan
                  ? 'Upgrade, downgrade, or cancel your subscription at any time.'
                  : 'Choose a plan to get started, or manage your subscription once active.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <button
                  disabled
                  className="flex flex-col items-center gap-3 p-5 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors text-center opacity-60 cursor-not-allowed"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <ArrowUpRight className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Upgrade Plan</p>
                    <p className="text-xs text-muted-foreground mt-1">Move to a higher tier for more conversations</p>
                  </div>
                </button>

                <button
                  disabled
                  className="flex flex-col items-center gap-3 p-5 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors text-center opacity-60 cursor-not-allowed"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <ArrowDownRight className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Downgrade Plan</p>
                    <p className="text-xs text-muted-foreground mt-1">Switch to a lower tier to save costs</p>
                  </div>
                </button>

                <button
                  disabled
                  className="flex flex-col items-center gap-3 p-5 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors text-center opacity-60 cursor-not-allowed"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Receipt className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Billing History</p>
                    <p className="text-xs text-muted-foreground mt-1">View invoices and past payments</p>
                  </div>
                </button>

                <button
                  disabled
                  className="flex flex-col items-center gap-3 p-5 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors text-center opacity-60 cursor-not-allowed"
                >
                  <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                    <XCircle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Cancel Subscription</p>
                    <p className="text-xs text-muted-foreground mt-1">End your plan at the next billing cycle</p>
                  </div>
                </button>
              </div>

              <p className="text-xs text-muted-foreground mt-4 text-center">
                These options will become active once payments are connected.
              </p>
            </CardContent>
          </Card>

          {/* Pricing Plans */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {currentPlan ? 'Switch Plans' : 'Choose a Plan'}
            </h2>
            <p className="text-muted-foreground mb-8">
              {currentPlan
                ? 'Upgrade or downgrade your plan at any time.'
                : 'Select a plan to continue after your free trial.'}
            </p>
            <PricingSection
              showComparison={true}
              ctaPath="/dashboard/subscription"
              ctaLabel={currentPlan ? 'Switch to This Plan' : 'Start 7-Day Free Trial'}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Subscription;
