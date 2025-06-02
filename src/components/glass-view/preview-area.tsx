
import type React from 'react';
import Image from 'next/image';
import { ChromeBar } from '@/components/glass-view/browser-bars/chrome-bar';
import { SafariBar } from '@/components/glass-view/browser-bars/safari-bar';
import { cn } from '@/lib/utils';

interface PreviewAreaProps {
  backgroundUrl: string | null;
  backgroundType: 'image' | 'video' | null;
  overlayUrl: string | null;
  overlayType: 'image' | 'video' | null;
  overlayStyle: React.CSSProperties; // This style includes the master opacity
  opacity: number; // Kept for potential direct use if needed, but main opacity is in overlayStyle
  roundedCorners: boolean;
  cornerRadiusPreview: string;
  browserBar: 'none' | 'chrome' | 'safari';
  browserUrl: string;
  browserBarHeightChrome: number;
  browserBarHeightSafari: number;
}

const PreviewArea: React.FC<PreviewAreaProps> = ({
  backgroundUrl,
  backgroundType,
  overlayUrl,
  overlayType,
  overlayStyle,
  roundedCorners,
  cornerRadiusPreview,
  browserBar,
  browserUrl,
  browserBarHeightChrome,
  browserBarHeightSafari,
}) => {
  const previewContainerStyle: React.CSSProperties = {
    borderRadius: roundedCorners ? cornerRadiusPreview : '0.5rem',
    transition: 'border-radius 0.3s ease-in-out',
  };

  const currentBrowserBarHeight = browserBar === 'chrome' ? browserBarHeightChrome : browserBar === 'safari' ? browserBarHeightSafari : 0;

  return (
    <div 
      className="w-full h-full max-w-[1280px] aspect-video bg-muted/50 shadow-inner overflow-hidden relative flex items-center justify-center"
      style={previewContainerStyle}
    >
      {backgroundUrl && backgroundType === 'image' && (
        <Image
          src={backgroundUrl}
          alt="Background"
          layout="fill"
          objectFit="contain"
          className="transition-opacity duration-300 ease-in-out"
          data-ai-hint="abstract background"
          priority
        />
      )}
      {backgroundUrl && backgroundType === 'video' && (
        <video
          src={backgroundUrl}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-contain transition-opacity duration-300 ease-in-out"
        />
      )}
      {!backgroundUrl && (
        <div className="text-muted-foreground">Upload a background image or video</div>
      )}

      {overlayUrl && (
        <div
          className="absolute transition-transform duration-100 ease-linear" 
          style={overlayStyle} // Applies scale, rotation, position, AND master opacity
        >
          <div 
            className={cn(
              "w-full h-full flex flex-col",
              roundedCorners && "overflow-hidden" 
            )}
            style={{
                borderRadius: roundedCorners ? cornerRadiusPreview : '0px', 
                // Opacity removed from here, it's handled by overlayStyle
            }}
            >
            {browserBar === 'chrome' && (
              <ChromeBar 
                urlText={browserUrl} 
                height={browserBarHeightChrome} 
                roundedTop={roundedCorners} 
                cornerRadius={cornerRadiusPreview} 
              />
            )}
            {browserBar === 'safari' && (
              <SafariBar 
                urlText={browserUrl} 
                height={browserBarHeightSafari} 
                roundedTop={roundedCorners} 
                cornerRadius={cornerRadiusPreview} 
              />
            )}

            <div 
                className="flex-1 w-full relative" // h-full removed, flex-1 handles height
                style={{ 
                    // Opacity removed from here
                    borderBottomLeftRadius: roundedCorners ? cornerRadiusPreview : '0px',
                    borderBottomRightRadius: roundedCorners ? cornerRadiusPreview : '0px',
                    overflow: 'hidden' 
                }}
            >
              {overlayType === 'image' && (
                <Image
                  src={overlayUrl}
                  alt="Overlay Content"
                  layout="fill"
                  objectFit="contain"
                  objectPosition="center top" // Added for top alignment
                  data-ai-hint="user interface"
                  // className="max-w-full max-h-full" removed
                />
              )}
              {overlayType === 'video' && (
                <video
                  src={overlayUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-contain"
                  style={{ objectPosition: 'center top' }} // Added for top alignment
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewArea;

    