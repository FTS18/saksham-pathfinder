import { Breadcrumbs } from './Breadcrumbs';

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader = ({ title, subtitle, children, className }: PageHeaderProps) => {
  return (
    <div className="pt-8 pb-6 border-b">
      <div className={`mx-auto px-4 ${className || 'max-w-3xl'}`}>
        <Breadcrumbs />
        {(title || subtitle || children) && (
          <div className="mt-4">
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