
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

  const overlayMediaContainerDynamicStyle: React.CSSProperties = {
    overflow: 'hidden', // Always clip the media itself
  };

  if (roundedCorners) {
    if (browserBar === 'none') {
      // If no browser bar, this media container defines the whole overlay shape
      overlayMediaContainerDynamicStyle.borderRadius = cornerRadiusPreview;
    } else {
      // If there IS a browser bar, this container only needs bottom rounding
      overlayMediaContainerDynamicStyle.borderBottomLeftRadius = cornerRadiusPreview;
      overlayMediaContainerDynamicStyle.borderBottomRightRadius = cornerRadiusPreview;
      overlayMediaContainerDynamicStyle.borderTopLeftRadius = '0px'; // Flat top to meet bar
      overlayMediaContainerDynamicStyle.borderTopRightRadius = '0px'; // Flat top to meet bar
    }
  } else {
    overlayMediaContainerDynamicStyle.borderRadius = '0px'; // No rounding
  }

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
          className="absolute transition-transform duration-100 ease-linear w-full h-full" 
          style={overlayStyle}
        >
          <div // This div groups Browser Bar + Content. It needs to clip if rounded.
            className="w-full h-full flex flex-col"
            style={{
              borderRadius: roundedCorners ? cornerRadiusPreview : '0px', // Overall rounding for the group
              overflow: roundedCorners ? 'hidden' : 'visible', // This clips children to the borderRadius
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

            {/* Overlay Content Area. */}
            <div
              className="flex-1 w-full relative" 
              style={overlayMediaContainerDynamicStyle}
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
                  className="w-full h-full object-contain" 
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
