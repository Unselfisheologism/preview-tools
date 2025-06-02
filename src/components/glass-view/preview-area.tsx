
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
  overlayStyle: React.CSSProperties; // This style includes the master opacity + transforms
  opacity: number; // Kept for potential direct use if needed
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
    borderRadius: roundedCorners ? cornerRadiusPreview : '0.5rem', // Main viewport rounding
  };

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
        <div // Transform & Opacity container for the overlay group
          className="absolute transition-transform duration-100 ease-linear w-full h-full" // Ensure w-full h-full
          style={overlayStyle}
        >
          <div // Groups Browser Bar + Content. This div will be rounded and clip its children.
            className="w-full h-full flex flex-col"
            style={{
              borderRadius: roundedCorners ? cornerRadiusPreview : '0px',
              overflow: roundedCorners ? 'hidden' : 'visible', // This clips children
            }}
          >
            {browserBar === 'chrome' && (
              <ChromeBar
                urlText={browserUrl}
                height={browserBarHeightChrome}
                roundedTop={roundedCorners} // Bar itself rounds its top background
                cornerRadius={cornerRadiusPreview}
              />
            )}
            {browserBar === 'safari' && (
              <SafariBar
                urlText={browserUrl}
                height={browserBarHeightSafari}
                roundedTop={roundedCorners} // Bar itself rounds its top background
                cornerRadius={cornerRadiusPreview}
              />
            )}

            {/* Overlay Content Area. Relies on parent for rounded clipping. */}
            <div
              className="flex-1 w-full relative" // Still needs to be relative for next/image layout="fill"
              style={{
                overflow: 'hidden', // Clips the actual Image/Video within this flex item
              }}
            >
              {overlayType === 'image' && (
                <Image
                  src={overlayUrl}
                  alt="Overlay Content"
                  layout="fill"
                  objectFit="contain"
                  objectPosition="center top"
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
                  className="w-full h-full object-contain" // Video takes full space of this div
                  style={{ objectPosition: 'center top' }}
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
