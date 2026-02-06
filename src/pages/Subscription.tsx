import { useState } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { useAuth } from '@/hooks/useAuth';
import { useConversations } from '@/hooks/useConversations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CreditCard, Calendar, MessageSquare, ArrowRight, TrendingUp, AlertCircle } from 'lucide-react';
import { PricingSection } from '@/components/pricing/PricingSection';
import { pricingPlans } from '@/components/pricing/PricingData';
import { cn } from '@/lib/utils';

const Subscription = () => {
  const { user } = useAuth();
  const { properties } = useConversations();

  // Mock subscription state – will be replaced by Stripe data
  const [currentPlan] = useState<string | null>(null); // null = no active plan (trial)
  const trialDaysLeft = 7;
  const conversationsUsed = 0;

  const activePlan = pricingPlans.find(p => p.id === currentPlan);
  const conversationLimit = activePlan?.conversationsNum || 500;
  const usagePercent = Math.min((conversationsUsed / conversationLimit) * 100, 100);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <PageHeader
          title="Subscription"
        />

        <div className="flex-1 p-6 space-y-8 max-w-6xl mx-auto w-full">
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
                  <>
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

                    <div className="border-t border-border/50 pt-4">
                      <h4 className="text-sm font-semibold text-foreground mb-3">Manage Plan</h4>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" disabled>
                          <ArrowRight className="h-3.5 w-3.5 mr-1.5" />
                          Upgrade Plan
                        </Button>
                        <Button variant="outline" size="sm" disabled>
                          Update Payment Method
                        </Button>
                        <Button variant="outline" size="sm" disabled>
                          View Billing History
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" disabled>
                          Cancel Subscription
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Payment management will be available once Stripe is connected.
                      </p>
                    </div>
                  </>
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
    </div>
  );
};

export default Subscription;
