
import type React from 'react';
import { TrafficLights, TabIcon, PlusIcon, LockClosedIcon, StarIcon, RefreshCwIcon, ArrowLeftIcon, ArrowRightIcon } from './common-icons';
import { cn } from '@/lib/utils';

interface ChromeBarProps {
  urlText: string;
  height: number;
  roundedTop?: boolean;
  cornerRadius?: string;
}

export const ChromeBar: React.FC<ChromeBarProps> = ({ urlText, height, roundedTop, cornerRadius }) => {
  const barStyle: React.CSSProperties = {
    height: `${height}px`,
    borderTopLeftRadius: roundedTop ? cornerRadius : '0px',
    borderTopRightRadius: roundedTop ? cornerRadius : '0px',
  };

  return (
    <div
      className={cn(
        "bg-[#F1F3F4] flex flex-col select-none overflow-hidden",
      )}
      style={barStyle}
    >
      {/* Tabs section */}
      <div className="h-[30px] flex items-end px-2 pt-1 relative">
        {/* Active Tab */}
        <div className="h-full flex items-center bg-white rounded-t-md px-3 py-1 shadow-sm relative -bottom-px border border-b-0 border-gray-300/70">
          <TabIcon className="w-3 h-3 mr-1.5 text-gray-600" />
          <span className="text-xs text-gray-700 truncate max-w-[100px]">Tab title</span>
          <button className="ml-2 text-gray-500 hover:text-gray-700">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
          </button>
        </div>
        {/* New Tab Button */}
        <button className="ml-1 p-1 rounded text-gray-600 hover:bg-gray-300/50">
          <PlusIcon className="w-4 h-4" />
        </button>
        {/* Mac-style traffic lights - pushed to the right via spacer or absolute positioning if within tabs bar */}
         <div className="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-1.5">
            <TrafficLights type="close" />
            <TrafficLights type="minimize" />
            <TrafficLights type="maximize" />
        </div>
      </div>

      {/* Address bar section */}
      <div className="h-[calc(100%-30px)] bg-[#DADCE0] flex items-center px-2 space-x-1.5 border-t border-gray-400/50">
        <button className="p-1 rounded hover:bg-black/10 text-gray-700"><ArrowLeftIcon className="w-4 h-4" /></button>
        <button className="p-1 rounded hover:bg-black/10 text-gray-700"><ArrowRightIcon className="w-4 h-4" /></button>
        <button className="p-1 rounded hover:bg-black/10 text-gray-700"><RefreshCwIcon className="w-3.5 h-3.5" /></button>
        
        <div className="flex-grow h-[24px] bg-white rounded-full flex items-center px-2.5 shadow-inner">
          <LockClosedIcon className="w-3 h-3 text-gray-500 mr-1.5" />
          <span className="text-xs text-gray-700 truncate flex-grow">{urlText}</span>
          <StarIcon className="w-3.5 h-3.5 text-gray-500 hover:text-yellow-500 ml-1.5" />
        </div>
         {/* Placeholder for extensions/profile */}
        <div className="w-5 h-5 bg-gray-500 rounded-full ml-1"></div>
      </div>
    </div>
  );
};

    