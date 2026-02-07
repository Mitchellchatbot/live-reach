import { Link } from 'react-router-dom';
import { Check, ArrowRight, Sparkles, TrendingUp, CreditCard } from 'lucide-react';
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
      {/* No credit card banner */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
          <CreditCard className="h-4 w-4" />
          No credit card required — start your free trial instantly
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto -mt-12">
        {pricingPlans.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              "relative group rounded-3xl border p-8 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 flex flex-col",
              plan.highlightClasses
                ? plan.highlightClasses
                : "bg-card/60 border-border/50 hover:border-primary/30",
              plan.popular && "shadow-xl shadow-primary/10 scale-[1.02]"
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
              <div className="mb-5 flex items-start gap-1.5 p-2 rounded-lg bg-primary/5 border border-primary/10">
                <TrendingUp className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-muted-foreground leading-snug">
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
          <h3 className="text-2xl font-bold text-center text-foreground mb-3">
            Compare Plans in Detail
          </h3>
          <p className="text-center text-muted-foreground mb-10 text-sm">
            See exactly what's included in each plan
          </p>

          <div className="rounded-2xl border border-border/40 overflow-hidden bg-card shadow-lg">
            {/* Table header */}
            <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] border-b border-border/40">
              <div className="p-4 md:p-5" />
              {pricingPlans.map((plan) => (
                <div key={plan.id} className={cn(
                  "p-4 md:p-5 text-center",
                  plan.popular && "bg-primary/5 border-x border-primary/10",
                )}>
                  <p className="font-bold text-foreground">{plan.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">${plan.price}<span>/mo</span></p>
                </div>
              ))}
            </div>

            {/* Category rows */}
            {comparisonCategories.map((category) => (
              <div key={category.name}>
                {/* Category header */}
                <div className="px-4 md:px-5 py-2.5 bg-muted/40 border-b border-border/30">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{category.name}</p>
                </div>

                {category.features.map((feature, idx) => (
                  <div
                    key={feature.name}
                    className={cn(
                      "grid grid-cols-[1.4fr_1fr_1fr_1fr] border-b border-border/10 transition-colors hover:bg-muted/10",
                      idx % 2 !== 0 && "bg-muted/[0.03]"
                    )}
                  >
                    <div className="px-4 md:px-5 py-3 text-sm text-foreground/80 flex items-center font-medium">
                      {feature.name}
                    </div>
                    {(['basic', 'professional', 'enterprise'] as const).map((planId) => {
                      const value = feature[planId];
                      const isPro = planId === 'professional';
                      return (
                        <div key={planId} className={cn(
                          "px-4 md:px-5 py-3 text-center flex items-center justify-center",
                          isPro && "bg-primary/[0.03] border-x border-primary/5",
                        )}>
                          {value === true ? (
                          <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shadow-sm shadow-primary/10">
                              <Check className="h-3.5 w-3.5 text-primary" strokeWidth={3} />
                            </div>
                          ) : value === false ? (
                            <span className="text-muted-foreground/25 text-sm">—</span>
                          ) : (
                            <span className="text-sm font-semibold text-foreground">{value}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}

            {/* Bottom CTA row */}
            <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] bg-muted/20 border-t border-border/30">
              <div className="p-4" />
              {pricingPlans.map((plan) => (
                <div key={plan.id} className={cn(
                  "p-4 flex items-center justify-center",
                  plan.popular && "bg-primary/[0.03] border-x border-primary/5",
                )}>
                  <Link to={ctaPath}>
                    <Button
                      variant={plan.popular ? 'default' : 'outline'}
                      size="sm"
                      className={cn(
                        "rounded-lg gap-1.5 font-semibold text-xs h-9 px-4",
                        plan.popular && "bg-gradient-to-r from-primary to-orange-500 text-primary-foreground border-0 shadow-md"
                      )}
                    >
                      {ctaLabel || 'Get Started'}
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
