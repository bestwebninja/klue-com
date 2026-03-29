import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  backgroundImage?: string;
}

export function PageHeader({ 
  title, 
  description, 
  children,
  className = '',
  backgroundImage
}: PageHeaderProps) {
  return (
    <>
      {/* Hero Header with optional background image */}
      <section 
        className={`relative h-[50vh] min-h-[400px] flex items-center justify-center ${className}`}
        style={backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center top' } : undefined}
      >
        {/* Dark overlay when using background image */}
        {backgroundImage && (
          <div className="absolute inset-0 bg-black/50" />
        )}
        {/* Solid background when no image */}
        {!backgroundImage && (
          <div className="absolute inset-0 bg-[hsl(var(--page-header-bg))]" />
        )}
        
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[hsl(var(--page-header-foreground))] mb-4">
            {title}
          </h1>
          {description && (
            <p className="text-[hsl(var(--page-header-foreground))]/80 max-w-2xl mx-auto">
              {description}
            </p>
          )}
          {children}
        </div>
      </section>
    </>
  );
}

export function PageHeaderCompact({ 
  title, 
  description,
  className = '',
  backgroundImage
}: Omit<PageHeaderProps, 'breadcrumbs' | 'children'>) {
  return (
    <section 
      className={`relative h-[40vh] min-h-[350px] flex items-center ${className}`}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center top' } : undefined}
    >
      {backgroundImage && (
        <div className="absolute inset-0 bg-black/50" />
      )}
      {!backgroundImage && (
        <div className="absolute inset-0 bg-[hsl(var(--page-header-bg))]" />
      )}
      
      <div className="relative container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[hsl(var(--page-header-foreground))]">
          {title}
        </h1>
        {description && (
          <p className="text-[hsl(var(--page-header-foreground))]/80 mt-2">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
