import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'subtle' | 'strong' | 'colored';
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  border?: boolean;
  shadow?: boolean;
}

export const GlassCard = ({
  children,
  className = "",
  variant = 'default',
  blur = 'md',
  border = true,
  shadow = true
}: GlassCardProps) => {
  const baseClasses = "relative overflow-hidden";
  
  const variantClasses = {
    default: "bg-background/80",
    subtle: "bg-background/60",
    strong: "bg-background/90",
    colored: "bg-gradient-to-br from-primary/10 to-secondary/10"
  };

  const blurClasses = {
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-lg",
    xl: "backdrop-blur-xl"
  };

  const borderClasses = border ? "border border-white/20" : "";
  const shadowClasses = shadow ? "shadow-xl shadow-black/10" : "";

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        blurClasses[blur],
        borderClasses,
        shadowClasses,
        "rounded-xl",
        className
      )}
    >
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

// Specialized glass components
export const GlassModal = ({ children, className = "", ...props }: GlassCardProps) => (
  <GlassCard
    variant="strong"
    blur="xl"
    shadow={true}
    className={cn("p-6", className)}
    {...props}
  >
    {children}
  </GlassCard>
);

export const GlassNavbar = ({ children, className = "", ...props }: GlassCardProps) => (
  <GlassCard
    variant="subtle"
    blur="md"
    border={false}
    className={cn("px-4 py-2", className)}
    {...props}
  >
    {children}
  </GlassCard>
);

export const GlassButton = ({ 
  children, 
  className = "", 
  onClick,
  disabled = false,
  ...props 
}: GlassCardProps & { 
  onClick?: () => void; 
  disabled?: boolean; 
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "transition-all duration-200 hover:scale-105 active:scale-95",
      disabled && "opacity-50 cursor-not-allowed"
    )}
  >
    <GlassCard
      variant="default"
      blur="sm"
      className={cn("px-4 py-2 hover:bg-background/90", className)}
      {...props}
    >
      {children}
    </GlassCard>
  </button>
);