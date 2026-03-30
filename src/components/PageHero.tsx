import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeroProps {
  /** The hero background image (ES6 imported asset) */
  backgroundImage?: string;
  /** Main title text */
  title: string;
  /** Optional subtitle/description */
  description?: string;
  /** Optional children for CTAs or additional content */
  children?: ReactNode;
  /** Height variant: 'full' (50vh), 'compact' (auto with padding) */
  variant?: 'full' | 'compact';
  /** Additional className for the section */
  className?: string;
  /** Text alignment */
  align?: 'center' | 'left';
}

export function PageHero({
  backgroundImage,
  title,
  description,
  children,
  variant = 'full',
  className,
  align = 'center',
}: PageHeroProps) {
  return (
    <section
      className={cn(
        'relative bg-cover bg-center pt-20',
        variant === 'full' 
          ? 'h-[50vh] min-h-[400px] flex items-center justify-center' 
          : 'py-16 md:py-20',
        className
      )}
      style={backgroundImage ? { 
        backgroundImage: `url(${backgroundImage})`,
        backgroundPosition: 'center top'
      } : undefined}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Content */}
      <div className={cn(
        'relative container mx-auto px-4',
        align === 'center' && 'text-center'
      )}>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
          {title}
        </h1>
        
        {description && (
          <p className={cn(
            'text-base md:text-lg lg:text-xl text-white/80',
            align === 'center' && 'max-w-2xl mx-auto'
          )}>
            {description}
          </p>
        )}
        
        {children && (
          <div className={cn(
            'mt-6 md:mt-8',
            align === 'center' && 'flex justify-center'
          )}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
