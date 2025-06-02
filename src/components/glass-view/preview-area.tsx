
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
  opacity: number; 
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
  overlayStyle,
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

  const overlayMediaContainerDynamicStyle: React.CSSProperties = {
    overflow: 'hidden', 
  };

  if (roundedCorners) {
    if (browserBar === 'none') {
      overlayMediaContainerDynamicStyle.borderRadius = cornerRadiusPreview;
    } else {
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
          priority={backgroundUrl.startsWith('http')} // Prioritize external images as they might be chosen first
          unoptimized={backgroundUrl.startsWith('blob:')} // Don't optimize blob URLs
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
            "absolute w-full h-full", 
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          )}
          style={overlayStyle}
          onMouseDown={onOverlayMouseDown} 
        >
          <div 
            className="w-full h-full flex flex-col"
            style={{
              borderRadius: roundedCorners ? cornerRadiusPreview : '0px', 
              overflow: roundedCorners ? 'hidden' : 'visible', 
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
