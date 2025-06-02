import type React from 'react';
import Image from 'next/image';
import CurvedEdge from './curved-edge';

interface PreviewAreaProps {
  backgroundUrl: string | null;
  backgroundType: 'image' | 'video' | null;
  overlayUrl: string | null;
  overlayType: 'image' | 'video' | null;
  overlayStyle: React.CSSProperties;
  edgeSize?: number;
}

const PreviewArea: React.FC<PreviewAreaProps> = ({
  backgroundUrl,
  backgroundType,
  overlayUrl,
  overlayType,
  overlayStyle,
  edgeSize = 40,
}) => {
  return (
    <div className="w-full h-full max-w-[1280px] aspect-video bg-muted/50 rounded-lg shadow-inner overflow-hidden relative flex items-center justify-center">
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

      {/* Curved Edges (only if background is present) */}
      {backgroundUrl && (
        <>
          <CurvedEdge corner="top-left" size={edgeSize} stroke="black" strokeWidth={3} />
          <CurvedEdge corner="top-right" size={edgeSize} stroke="black" strokeWidth={3} />
          <CurvedEdge corner="bottom-left" size={edgeSize} stroke="black" strokeWidth={3} />
          <CurvedEdge corner="bottom-right" size={edgeSize} stroke="black" strokeWidth={3} />
        </>
      )}

      {/* Overlay */}
      {overlayUrl && (
        <div
          className="absolute transition-transform duration-100 ease-linear" // For smooth transform adjustments
          style={{
            ...overlayStyle,
            maxWidth: '100%',
            maxHeight: '100%',
            // Ensure overlay is centered if its dimensions are smaller than parent after transform
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {overlayType === 'image' && (
            <Image
              src={overlayUrl}
              alt="Overlay"
              width={1920} // Max typical screen width, will be scaled by objectFit and transform
              height={1080} // Max typical screen height
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
