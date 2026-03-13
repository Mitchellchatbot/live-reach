import { useEffect } from 'react';
import careAssistLogo from '@/assets/care-assist-logo.png';
import { Check, Star } from 'lucide-react';

const GetStarted = () => {
  useEffect(() => {
    // Load LeadConnector embed script
    const script = document.createElement('script');
    script.src = 'https://link.msgsndr.com/js/form_embed.js';
    script.type = 'text/javascript';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full py-4 px-6 border-b border-border/50">
        <div className="max-w-5xl mx-auto flex items-center justify-center">
          <img src={careAssistLogo} alt="Care Assist" className="h-8" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start px-3 md:px-4 py-6 md:py-16">
        <div className="max-w-2xl w-full text-center space-y-4 md:space-y-6">
          {/* Social proof */}
          <div className="inline-flex items-center gap-2 bg-muted/60 rounded-full px-4 py-1.5">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />
              ))}
            </div>
            <span className="text-xs font-semibold text-foreground">Trusted by 100+ treatment centers</span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl md:text-5xl font-bold tracking-tight text-foreground">
            Get Started For{' '}
            <span className="text-primary">Free</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg max-w-xl mx-auto">
            Fill out the form below and we'll get your AI agent set up in minutes.
          </p>

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-4 md:gap-5 text-xs md:text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary/15">
                <Check className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary" />
              </span>
              No credit card
            </span>
            <span className="flex items-center gap-1.5">
              <span className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary/15">
                <Check className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary" />
              </span>
              Cancel anytime
            </span>
          </div>

          {/* Survey/Form Embed */}
          <div className="w-full mt-4 md:mt-6 rounded-xl md:rounded-2xl overflow-hidden border border-border/50 shadow-lg bg-card p-1.5 md:p-6">
            <iframe
              src="https://api.leadconnectorhq.com/widget/survey/VarcMdVarl1QzePQtEih"
              style={{ width: '100%', border: 'none', overflow: 'hidden', minHeight: '500px' }}
              scrolling="no"
              id="VarcMdVarl1QzePQtEih"
              title="Get Started Survey"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default GetStarted;
