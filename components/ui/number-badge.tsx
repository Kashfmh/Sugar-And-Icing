import * as React from 'react';
import { cn } from '@/lib/styles/classNames';

interface NumberBadgeProps {
    number: number;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-10 h-10 text-lg',
    lg: 'w-12 h-12 text-xl',
    xl: 'w-14 h-14 text-2xl',
};

export default function NumberBadge({ number, size = 'md', className }: NumberBadgeProps) {
    return (
        <div
            className={cn(
                'rounded-full bg-sai-pink text-white flex items-center justify-center font-bold',
                sizeClasses[size],
                className
            )}
        >
            {number}
        </div>
    );
}
