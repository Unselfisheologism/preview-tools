
import type React from 'react';
import Image from 'next/image';
import { ChromeBar } from '@/components/glass-view/browser-bars/chrome-bar';
import { SafariBar } from '@/components/glass-view/browser-bars/safari-bar';
import { cn } from '@/lib/utils';

interface PreviewAreaProps {
  backgroundMode: 'default' | 'custom' | 'solid' | 'transparent';
  backgroundUrl: string | null;
  backgroundHint: string | null;
  solidBackgroundColor: string;
  backgroundEffectBlur: number;
  backgroundEffectBrightness: number;
  backgroundEffectContrast: number;
  backgroundEffectSaturation: number;
  backgroundEffectVignette: number;
  backgroundEffectNoise: number;
  activeVfx: 'none' | 'cornerGlow';

  overlayUrl: string | null;
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
  backgroundHint,
  solidBackgroundColor,
  backgroundEffectBlur,
  backgroundEffectBrightness,
  backgroundEffectContrast,
  backgroundEffectSaturation,
  backgroundEffectVignette,
  backgroundEffectNoise,
  activeVfx,

  overlayUrl,
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
    position: 'relative',
    overflow: 'hidden',
  };

  const backgroundElementStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
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
    zIndex: 1,
  };

  if (activeVfx === 'cornerGlow') {
    effectsOverlayStyle.background = `radial-gradient(circle at 0% 0%, rgba(255,255,220,0.3) 0%, transparent 40%)`;
  }
  if (backgroundEffectVignette > 0) {
    const existingBackground = effectsOverlayStyle.background ? `${effectsOverlayStyle.background}, ` : '';
    effectsOverlayStyle.background = `${existingBackground}radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0, ${backgroundEffectVignette}) 100%)`;
  }

  const noiseOverlayStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    opacity: backgroundEffectNoise,
    zIndex: 2,
  };


  const overlayClipContainerStyle: React.CSSProperties = {
    borderRadius: roundedCorners ? cornerRadiusPreview : '0px',
    overflow: roundedCorners ? 'hidden' : 'visible',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    zIndex: 3,
  };

  const overlayMediaContainerDynamicStyle: React.CSSProperties = {
    flex: 1,
    width: '100%',
    position: 'relative',
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
      className="w-full h-full max-w-[1280px] aspect-video bg-muted/30 shadow-inner overflow-hidden flex items-center justify-center"
      style={previewContainerStyle}
    >
      {(backgroundMode === 'default' || backgroundMode === 'custom') && backgroundUrl && (
        <Image
          src={backgroundUrl}
          alt="Background"
          fill
          style={backgroundElementStyle}
          className="transition-opacity duration-300 ease-in-out"
          data-ai-hint={backgroundHint || 'abstract background'}
          priority={backgroundUrl.startsWith('http')}
          unoptimized={backgroundUrl.startsWith('blob:')}
          sizes="100vw"
        />
      )}
      {(backgroundMode !== 'solid' && backgroundMode !== 'transparent') && !backgroundUrl && (
        <div className="text-muted-foreground z-[1]">Upload or select a default background</div>
      )}

      {(activeVfx !== 'none' || backgroundEffectVignette > 0) && (
        <div style={effectsOverlayStyle}></div>
      )}

      {backgroundEffectNoise > 0 && (
        <div style={noiseOverlayStyle}></div>
      )}

      {overlayUrl && (
        <div
          className={cn("absolute")}
          style={overlayStyle} 
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
              <Image
                src={overlayUrl}
                alt="Overlay Content"
                fill
                style={{ objectFit: 'contain', objectPosition: 'center top'}}
                data-ai-hint="user interface"
                unoptimized={overlayUrl.startsWith('blob:')}
                sizes="100vw"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewArea;

