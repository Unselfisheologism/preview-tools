
import type React from 'react';
import Image from 'next/image';
import { ChromeBar } from '@/components/glass-view/browser-bars/chrome-bar';
import { SafariBar } from '@/components/glass-view/browser-bars/safari-bar';
import { cn } from '@/lib/utils';

interface PreviewAreaProps {
  backgroundUrl: string | null;
  backgroundType: 'image' | 'video' | null;
  backgroundHint: string | null;
  overlayUrl: string | null;
  overlayType: 'image' | 'video' | null;
  overlayStyle: React.CSSProperties; 
  roundedCorners: boolean;
  cornerRadiusPreview: string;
  browserBar: 'none' | 'chrome' | 'safari';
  browserUrl: string;
  browserBarHeightChrome: number;
  browserBarHeightSafari: number;
  onOverlayMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void; 
  isDragging: boolean; 
}

const PreviewArea: React.FC<PreviewAreaProps> = ({
  backgroundUrl,
  backgroundType,
  backgroundHint,
  overlayUrl,
  overlayType,
  overlayStyle, // This now includes opacity, transform, and filter
  roundedCorners,
  cornerRadiusPreview,
  browserBar,
  browserUrl,
  browserBarHeightChrome,
  browserBarHeightSafari,
  onOverlayMouseDown, 
  isDragging, 
}) => {
  const previewContainerStyle: React.CSSProperties = {
    borderRadius: roundedCorners ? cornerRadiusPreview : '0.5rem', 
  };

  // This style is for the container that clips the browser bar and media content together.
  const overlayClipContainerStyle: React.CSSProperties = {
    borderRadius: roundedCorners ? cornerRadiusPreview : '0px',
    overflow: roundedCorners ? 'hidden' : 'visible',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  };

  // This style is for the direct container of the overlay media (image/video).
  // It ensures the media itself is clipped if necessary, especially its bottom corners.
  const overlayMediaContainerDynamicStyle: React.CSSProperties = {
    flex: 1,
    width: '100%',
    position: 'relative', // Needed for next/image layout="fill"
    overflow: 'hidden', // Always clip media within this container
  };

  if (roundedCorners) {
    if (browserBar === 'none') {
      // If no browser bar, media container gets all corners rounded from its parent (overlayClipContainerStyle)
      // No specific style needed here as parent handles it.
    } else {
      // If browser bar is present, media container only needs bottom corners rounded.
      // Top corners are flat against the browser bar.
      // The parent overlayClipContainerStyle handles the overall top rounding.
       overlayMediaContainerDynamicStyle.borderBottomLeftRadius = cornerRadiusPreview;
       overlayMediaContainerDynamicStyle.borderBottomRightRadius = cornerRadiusPreview;
       overlayMediaContainerDynamicStyle.borderTopLeftRadius = '0px';
       overlayMediaContainerDynamicStyle.borderTopRightRadius = '0px';
    }
  } else {
    overlayMediaContainerDynamicStyle.borderRadius = '0px';
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
          data-ai-hint={backgroundHint || 'abstract background'}
          priority={backgroundUrl.startsWith('http')} 
          unoptimized={backgroundUrl.startsWith('blob:')} 
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
        <div className="text-muted-foreground">Upload or select a default background</div>
      )}

      {overlayUrl && (
        <div 
          className={cn(
            "absolute", // Removed w-full h-full, let overlayStyle dictate size if needed, or rely on content.
                        // overlayStyle itself has w/h 100%
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          )}
          style={overlayStyle} // This style has opacity, transform, and filter.
          onMouseDown={onOverlayMouseDown} 
        >
          <div style={overlayClipContainerStyle}>
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
                  unoptimized={overlayUrl.startsWith('blob:')}
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
