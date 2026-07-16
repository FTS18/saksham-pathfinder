import { Breadcrumbs } from './Breadcrumbs';

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader = ({ title, subtitle, children, className }: PageHeaderProps) => {
  return (
    <div className="pt-8 pb-6 border-b border-border/40">
      <div className={`w-full mx-auto px-4 sm:px-6 lg:px-8 ${className || 'max-w-6xl'}`}>
        
        {(title || subtitle || children) && (
          <div className="mt-2">
            {title && (
              <h1 className="text-3xl font-racing font-bold text-foreground mb-2">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-muted-foreground">
                {subtitle}
              </p>
            )}
            {children}
          </div>
        )}
      </div>
    </div>
  );
};