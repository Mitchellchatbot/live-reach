import { Link } from 'react-router-dom';
import { Check, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { pricingPlans, comparisonCategories } from './PricingData';

interface PricingSectionProps {
  /** Show the full comparison table below the cards */
  showComparison?: boolean;
  /** CTA destination, defaults to /auth */
  ctaPath?: string;
  /** Override CTA label */
  ctaLabel?: string;
}

export const PricingSection = ({ showComparison = true, ctaPath = '/auth', ctaLabel }: PricingSectionProps) => {
  return (
    <div className="space-y-20">
      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
        {pricingPlans.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              "relative group rounded-3xl border bg-card/60 backdrop-blur-sm p-8 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 flex flex-col",
              plan.popular
                ? "border-primary/50 shadow-xl shadow-primary/10 scale-[1.02]"
                : "border-border/50 hover:border-primary/30"
            )}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-primary to-orange-500 text-primary-foreground border-0 px-4 py-1 text-sm font-bold shadow-lg shadow-primary/30">
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  Most Popular
                </Badge>
              </div>
            )}

            {/* Header */}
            <div className="mb-6">
              <div className={cn(
                "h-12 w-12 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500",
                plan.gradient
              )}>
                <plan.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-foreground">${plan.price}</span>
                <span className="text-muted-foreground font-medium">/mo</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Up to <span className="font-semibold text-foreground">{plan.conversations}</span> conversations
              </p>
            </div>

            {/* Overflow badge for Enterprise */}
            {plan.overflow && (
              <div className="mb-6 flex items-start gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
                <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {plan.overflow}
                </p>
              </div>
            )}

            {/* Features */}
            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Link to={ctaPath} className="mt-auto">
              <Button
                className={cn(
                  "w-full h-12 text-base font-bold rounded-xl gap-2 group/btn",
                  plan.popular
                    ? "bg-gradient-to-r from-primary to-orange-500 text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/25"
                    : ""
                )}
                variant={plan.popular ? 'default' : 'outline'}
                size="lg"
              >
                {ctaLabel || 'Start 7-Day Free Trial'}
                <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      {showComparison && (
        <div className="max-w-5xl mx-auto">
          <h3 className="text-2xl font-bold text-center text-foreground mb-8">
            Compare Plans in Detail
          </h3>

          <div className="rounded-2xl border border-border/50 overflow-hidden bg-card/60 backdrop-blur-sm">
            {/* Table header */}
            <div className="grid grid-cols-4 bg-muted/50 border-b border-border/50">
              <div className="p-4 font-semibold text-foreground text-sm">Feature</div>
              {pricingPlans.map((plan) => (
                <div key={plan.id} className="p-4 text-center">
                  <p className="font-bold text-foreground">{plan.name}</p>
                  <p className="text-xs text-muted-foreground">${plan.price}/mo</p>
                </div>
              ))}
            </div>

            {/* Category rows */}
            {comparisonCategories.map((category) => (
              <div key={category.name}>
                {/* Category header */}
                <div className="bg-muted/30 px-4 py-2 border-b border-border/30">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{category.name}</p>
                </div>

                {category.features.map((feature, idx) => (
                  <div
                    key={feature.name}
                    className={cn(
                      "grid grid-cols-4 border-b border-border/20",
                      idx % 2 === 0 ? "bg-background/50" : "bg-muted/10"
                    )}
                  >
                    <div className="p-3 text-sm text-foreground/80 flex items-center">
                      {feature.name}
                    </div>
                    {(['basic', 'professional', 'enterprise'] as const).map((planId) => {
                      const value = feature[planId];
                      return (
                        <div key={planId} className="p-3 text-center flex items-center justify-center">
                          {value === true ? (
                            <Check className="h-4 w-4 text-primary" />
                          ) : value === false ? (
                            <span className="text-muted-foreground/40">—</span>
                          ) : (
                            <span className="text-sm font-medium text-foreground">{value}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
