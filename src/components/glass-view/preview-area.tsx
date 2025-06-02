
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
  overlayStyle: React.CSSProperties;
  opacity: number;
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
  opacity,
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
      {/* Background */}
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

      {/* Overlay Container (handles transform, includes browser bar and content) */}
      {overlayUrl && (
        <div
          className="absolute transition-transform duration-100 ease-linear" 
          style={{
            ...overlayStyle, // This applies scale, rotation, position
            // opacity is handled differently based on browser bar
          }}
        >
          <div 
            className={cn(
              "w-full h-full flex flex-col",
              roundedCorners && "overflow-hidden" // Clip children if main container is rounded
            )}
            style={{
                borderRadius: roundedCorners ? cornerRadiusPreview : '0px', // Match outer rounding for internal clipping
                opacity: browserBar !== 'none' ? opacity : 1, // Apply opacity to this container if bar exists
            }}
            >
            {/* Browser Bar */}
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

            {/* Overlay Content (Image/Video) */}
            <div 
                className="flex-1 w-full h-full relative" // Takes remaining space
                style={{ 
                    opacity: browserBar === 'none' ? opacity : 1, // If no bar, apply opacity here
                    // If bar + rounded, bottom corners of this div should be rounded
                    borderBottomLeftRadius: roundedCorners ? cornerRadiusPreview : '0px',
                    borderBottomRightRadius: roundedCorners ? cornerRadiusPreview : '0px',
                    overflow: 'hidden' // Ensures content respects these radii
                }}
            >
              {overlayType === 'image' && (
                <Image
                  src={overlayUrl}
                  alt="Overlay Content"
                  layout="fill"
                  objectFit="contain"
                  className="max-w-full max-h-full"
                  data-ai-hint="user interface"
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

    