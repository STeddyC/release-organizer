import React from 'react';
import { Music2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface LogoProps {
  variant?: 'light' | 'dark';
  className?: string;
  isCollapsed?: boolean;
}

export function Logo({ variant = 'dark', className, isCollapsed = false }: LogoProps) {
  return (
    <div className={cn(
      'flex items-center gap-2',
      isCollapsed ? 'justify-center' : 'justify-start',
      className
    )}>
      <Music2 
        className={cn(
          'h-8 w-8',
          variant === 'light' ? 'text-white' : 'text-primary'
        )}
      />
      {!isCollapsed && (
        <span className={cn(
          'font-semibold text-lg',
          variant === 'light' ? 'text-white' : 'text-gray-900'
        )}>
          Music Organizer
        </span>
      )}
    </div>
  );
}

export default Logo;