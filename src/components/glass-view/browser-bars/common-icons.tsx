
import type React from 'react';
import { LockClosedIcon as RadixLock, StarIcon as RadixStar, Share1Icon as RadixShare, PlusIcon as RadixPlus, ReaderIcon as RadixLayoutGrid, ArrowLeftIcon as RadixArrowLeft, ArrowRightIcon as RadixArrowRight, ReloadIcon as RadixRefresh } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';


export const TrafficLights: React.FC<{ type: 'close' | 'minimize' | 'maximize', className?: string }> = ({ type, className }) => {
  const colors = {
    close: 'bg-red-500',
    minimize: 'bg-yellow-400',
    maximize: 'bg-green-500',
  };
  return <div className={cn("w-3 h-3 rounded-full", colors[type], className)}></div>;
};

export const TabIcon: React.FC<{ className?: string }> = ({ className }) => ( // Generic tab icon
  <svg className={cn("w-4 h-4", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

export const PlusIcon: React.FC<{ className?: string }> = ({ className }) => <RadixPlus className={cn("w-4 h-4", className)} />;

export const LockClosedIcon: React.FC<{ className?: string }> = ({ className }) => <RadixLock className={cn("w-4 h-4", className)} />;

export const StarIcon: React.FC<{ className?: string }> = ({ className }) => <RadixStar className={cn("w-4 h-4", className)} />;

export const ShareIcon: React.FC<{ className?: string }> = ({ className }) => <RadixShare className={cn("w-4 h-4", className)} />;

export const PlusSquareIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={cn("w-4 h-4", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6m-9 3V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3Z" />
    </svg>
);


export const LayoutGridIcon: React.FC<{ className?: string }> = ({ className }) => <RadixLayoutGrid className={cn("w-4 h-4", className)} />;

export const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className }) => <RadixArrowLeft className={cn("w-4 h-4", className)} />;
export const ArrowRightIcon: React.FC<{ className?: string }> = ({ className }) => <RadixArrowRight className={cn("w-4 h-4", className)} />;
export const RefreshCwIcon: React.FC<{ className?: string }> = ({ className }) => <RadixRefresh className={cn("w-4 h-4", className)} />;


    