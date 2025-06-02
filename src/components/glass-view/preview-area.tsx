
import type React from 'react';
import Image from 'next/image';

interface PreviewAreaProps {
  backgroundUrl: string | null;
  backgroundType: 'image' | 'video' | null;
  overlayUrl: string | null;
  overlayType: 'image' | 'video' | null;
  overlayStyle: React.CSSProperties;
  roundedCorners: boolean;
  cornerRadiusPreview: string;
}

const PreviewArea: React.FC<PreviewAreaProps> = ({
  backgroundUrl,
  backgroundType,
  overlayUrl,
  overlayType,
  overlayStyle,
  roundedCorners,
  cornerRadiusPreview,
}) => {
  const previewContainerStyle: React.CSSProperties = {
    borderRadius: roundedCorners ? cornerRadiusPreview : '0.5rem', // 0.5rem is default rounded-lg
    transition: 'border-radius 0.3s ease-in-out', // Smooth transition for radius change
  };

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

      {/* Overlay */}
      {overlayUrl && (
        <div
          className="absolute transition-transform duration-100 ease-linear" 
          style={{
            ...overlayStyle,
            maxWidth: '100%',
            maxHeight: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {overlayType === 'image' && (
            <Image
              src={overlayUrl}
              alt="Overlay"
              width={1920} 
              height={1080} 
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
              className="max-w-full max-h-full object-contain"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default PreviewArea;
