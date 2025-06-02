
import type React from 'react';
import Image from 'next/image';
import { ChromeBar } from '@/components/glass-view/browser-bars/chrome-bar';
import { SafariBar } from '@/components/glass-view/browser-bars/safari-bar';
import { cn } from '@/lib/utils';

interface PreviewAreaProps {
  backgroundMode: 'default' | 'custom' | 'solid' | 'transparent';
  backgroundUrl: string | null;
  backgroundType: 'image' | 'video' | null;
  backgroundHint: string | null;
  solidBackgroundColor: string;
  backgroundEffectBlur: number;
  backgroundEffectBrightness: number;
  backgroundEffectContrast: number;
  backgroundEffectSaturation: number;
  backgroundEffectVignette: number;
  activeVfx: 'none' | 'cornerGlow';

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
  backgroundMode,
  backgroundUrl,
  backgroundType,
  backgroundHint,
  solidBackgroundColor,
  backgroundEffectBlur,
  backgroundEffectBrightness,
  backgroundEffectContrast,
  backgroundEffectSaturation,
  backgroundEffectVignette,
  activeVfx,

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
    position: 'relative', // For absolute positioning of effects overlay
    overflow: 'hidden', // To clip effects and content by rounded corners
  };

  const backgroundElementStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'contain', // For images/videos
    transition: 'opacity 0.3s ease-in-out, filter 0.3s ease-in-out',
    filter: `blur(${backgroundEffectBlur}px) brightness(${backgroundEffectBrightness}) contrast(${backgroundEffectContrast}) saturate(${backgroundEffectSaturation})`,
  };
  
  if (backgroundMode === 'solid') {
    previewContainerStyle.backgroundColor = solidBackgroundColor;
  } else if (backgroundMode === 'transparent') {
    previewContainerStyle.backgroundImage = `
      linear-gradient(45deg, #e0e0e0 25%, transparent 25%), 
      linear-gradient(-45deg, #e0e0e0 25%, transparent 25%), 
      linear-gradient(45deg, transparent 75%, #e0e0e0 75%), 
      linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)`;
    previewContainerStyle.backgroundSize = '20px 20px';
    previewContainerStyle.backgroundPosition = '0 0, 0 10px, 10px -10px, -10px 0px';
  }

  const effectsOverlayStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 1, // Above background, below main overlay
  };

  if (activeVfx === 'cornerGlow') {
    effectsOverlayStyle.background = `radial-gradient(circle at 0% 0%, rgba(255,255,220,0.3) 0%, transparent 40%)`;
  }
  if (backgroundEffectVignette > 0) {
    const existingBackground = effectsOverlayStyle.background ? `${effectsOverlayStyle.background}, ` : '';
    effectsOverlayStyle.background = `${existingBackground}radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0, ${backgroundEffectVignette}) 100%)`;
     // Alternatively, use box-shadow, but radial gradient is often smoother for vignette
    // effectsOverlayStyle.boxShadow = `inset 0 0 70px 30px rgba(0,0,0, ${backgroundEffectVignette})`;
  }


  // This style is for the container that clips the browser bar and media content together.
  const overlayClipContainerStyle: React.CSSProperties = {
    borderRadius: roundedCorners ? cornerRadiusPreview : '0px',
    overflow: roundedCorners ? 'hidden' : 'visible',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative', // Ensure it's a stacking context
    zIndex: 2, // Above effects overlay
  };

  const overlayMediaContainerDynamicStyle: React.CSSProperties = {
    flex: 1,
    width: '100%',
    position: 'relative', 
    overflow: 'hidden', 
  };

  if (roundedCorners) {
    if (browserBar === 'none') {
       // Handled by overlayClipContainerStyle
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
      className="w-full h-full max-w-[1280px] aspect-video bg-muted/30 shadow-inner overflow-hidden flex items-center justify-center"
      style={previewContainerStyle}
    >
      {(backgroundMode === 'default' || backgroundMode === 'custom') && backgroundUrl && backgroundType === 'image' && (
        <Image
          src={backgroundUrl}
          alt="Background"
          layout="fill"
          style={backgroundElementStyle}
          className="transition-opacity duration-300 ease-in-out"
          data-ai-hint={backgroundHint || 'abstract background'}
          priority={backgroundUrl.startsWith('http')} 
          unoptimized={backgroundUrl.startsWith('blob:')} 
        />
      )}
      {(backgroundMode === 'default' || backgroundMode === 'custom') && backgroundUrl && backgroundType === 'video' && (
        <video
          src={backgroundUrl}
          autoPlay
          loop
          muted
          playsInline
          style={backgroundElementStyle}
          className="w-full h-full object-contain transition-opacity duration-300 ease-in-out"
        />
      )}
      {(backgroundMode !== 'solid' && backgroundMode !== 'transparent') && !backgroundUrl && (
        <div className="text-muted-foreground z-[1]">Upload or select a default background</div>
      )}
      
      {(activeVfx !== 'none' || backgroundEffectVignette > 0) && (
        <div style={effectsOverlayStyle}></div>
      )}


      {overlayUrl && (
        <div 
          className={cn(
            "absolute", 
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          )}
          style={{...overlayStyle, zIndex: 3}} // Ensure overlayStyle applies transform, opacity, filter
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

            <div style={overlayMediaContainerDynamicStyle}>
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

