
import type React from 'react';
import { TrafficLights, ShareIcon, PlusSquareIcon, LayoutGridIcon } from './common-icons';
import { cn } from '@/lib/utils';

interface SafariBarProps {
  urlText: string;
  height: number;
  roundedTop?: boolean;
  cornerRadius?: string;
}

export const SafariBar: React.FC<SafariBarProps> = ({ urlText, height, roundedTop, cornerRadius }) => {
  const barStyle: React.CSSProperties = {
    height: `${height}px`,
    borderTopLeftRadius: roundedTop ? cornerRadius : '0px',
    borderTopRightRadius: roundedTop ? cornerRadius : '0px',
  };
  return (
    <div
      className={cn(
        "bg-neutral-200/80 backdrop-blur-sm flex items-center px-3 space-x-2 select-none overflow-hidden",
        "border-b border-neutral-300/70"
      )}
      style={barStyle}
    >
      <div className="flex space-x-1.5">
        <TrafficLights type="close" />
        <TrafficLights type="minimize" />
        <TrafficLights type="maximize" />
      </div>
      <div className="flex-grow h-[28px] bg-neutral-100/90 rounded-md flex items-center justify-center px-3 shadow-inner">
        <span className="text-xs text-neutral-700 truncate">{urlText}</span>
      </div>
      <div className="flex items-center space-x-1 text-neutral-600">
        <button className="p-1 rounded hover:bg-neutral-300/50"><ShareIcon className="w-4 h-4" /></button>
        <button className="p-1 rounded hover:bg-neutral-300/50"><PlusSquareIcon className="w-4 h-4" /></button>
        <button className="p-1 rounded hover:bg-neutral-300/50"><LayoutGridIcon className="w-4 h-4" /></button>
      </div>
    </div>
  );
};

    