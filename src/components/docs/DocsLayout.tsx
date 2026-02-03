import { Outlet, Link } from 'react-router-dom';
import { DocsSidebar } from './DocsSidebar';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useSlideIn, useFadeIn } from '@/hooks/useGSAP';

export const DocsLayout = () => {
  const sidebarRef = useSlideIn<HTMLDivElement>('left');
  const contentRef = useFadeIn<HTMLDivElement>();

  return (
    <div className="flex h-screen bg-background">
      <div ref={sidebarRef}>
        <DocsSidebar />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b border-border flex items-center px-6 bg-background">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </header>

        {/* Content */}
        <main ref={contentRef} className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
