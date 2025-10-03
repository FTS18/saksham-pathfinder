import { ReactNode } from 'react';
import { Breadcrumbs } from './Breadcrumbs';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}

export const PageHeader = ({ title, description, icon, actions, children }: PageHeaderProps) => {
  return (
    <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b">
      <div className="max-w-6xl mx-auto px-4 py-2">
        <Breadcrumbs />
        <div className="flex items-center justify-between mt-2">
          <div>
            <h1 className="text-3xl font-racing font-bold text-foreground mb-6 flex items-center gap-2">
              {icon}
              {title}
            </h1>
            {description && (
              <p className="text-muted-foreground mb-4">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex gap-2">
              {actions}
            </div>
          )}
        </div>
        {children}
      </div>
    </div>
  );
};