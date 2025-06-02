
'use client';

import type React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import ControlsPanel from '@/components/glass-view/controls-panel';
import PreviewArea from '@/components/glass-view/preview-area';
import { useToast } from "@/hooks/use-toast";

const EXPORT_CORNER_RADIUS = 30; // For canvas export
const PREVIEW_CORNER_RADIUS_CSS = '20px'; // For CSS preview

export default function GlassViewPage() {
  const { toast } = useToast();

  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [backgroundType, setBackgroundType] = useState<'image' | 'video' | null>(null);

  const [overlayFile, setOverlayFile] = useState<File | null>(null);
  const [overlayUrl, setOverlayUrl] = useState<string | null>(null);
  const [overlayType, setOverlayType] = useState<'image' | 'video' | null>(null);

  const [opacity, setOpacity] = useState(0.7);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);
  const [roundedCorners, setRoundedCorners] = useState(false);

  const [isExporting, setIsExporting] = useState(false);

  const backgroundMediaRef = useRef<HTMLImageElement | HTMLVideoElement | null>(null);
  const overlayMediaRef = useRef<HTMLImageElement | HTMLVideoElement | null>(null);
  // const canvasRef = useRef<HTMLCanvasElement | null>(null); // Not directly used for drawing, local canvas created


  const handleFileChange = (
    file: File | null,
    setUrl: React.Dispatch<React.SetStateAction<string | null>>,
    setType: React.Dispatch<React.SetStateAction<'image' | 'video' | null>>
  ) => {
    if (file) {
      const newUrl = URL.createObjectURL(file);
      setUrl(newUrl);
      setType(file.type.startsWith('image/') ? 'image' : 'video');
    } else {
      setUrl(null);
      setType(null);
    }
  };

  useEffect(() => {
    handleFileChange(backgroundFile, setBackgroundUrl, setBackgroundType);
    return () => {
      if (backgroundUrl) URL.revokeObjectURL(backgroundUrl);
    };
  }, [backgroundFile, backgroundUrl]); // Added backgroundUrl to dependencies

  useEffect(() => {
    handleFileChange(overlayFile, setOverlayUrl, setOverlayType);
    return () => {
      if (overlayUrl) URL.revokeObjectURL(overlayUrl);
    };
  }, [overlayFile, overlayUrl]); // Added overlayUrl to dependencies

  const overlayStyle: React.CSSProperties = {
    opacity,
    transform: `translate(${positionX}px, ${positionY}px) scale(${scale}) rotate(${rotation}deg)`,
    width: overlayType === 'image' ? 'auto' : '100%',
    height: overlayType === 'image' ? 'auto' : '100%',
  };
  
  const drawFrameOnCanvas = useCallback(async (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (roundedCorners) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(EXPORT_CORNER_RADIUS, 0);
      ctx.lineTo(canvas.width - EXPORT_CORNER_RADIUS, 0);
      ctx.quadraticCurveTo(canvas.width, 0, canvas.width, EXPORT_CORNER_RADIUS);
      ctx.lineTo(canvas.width, canvas.height - EXPORT_CORNER_RADIUS);
      ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - EXPORT_CORNER_RADIUS, canvas.height);
      ctx.lineTo(EXPORT_CORNER_RADIUS, canvas.height);
      ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - EXPORT_CORNER_RADIUS);
      ctx.lineTo(0, EXPORT_CORNER_RADIUS);
      ctx.quadraticCurveTo(0, 0, EXPORT_CORNER_RADIUS, 0);
      ctx.closePath();
      ctx.clip();
    }

    // Draw background
    const bgMedia = document.getElementById('background-media-export') as HTMLImageElement | HTMLVideoElement;
    if (bgMedia) {
        if (backgroundType === 'image' && bgMedia instanceof HTMLImageElement && bgMedia.complete) {
             const { drawWidth, drawHeight, offsetX, offsetY } = getContainSize(canvas.width, canvas.height, bgMedia.naturalWidth, bgMedia.naturalHeight);
             ctx.drawImage(bgMedia, offsetX, offsetY, drawWidth, drawHeight);
        } else if (backgroundType === 'video' && bgMedia instanceof HTMLVideoElement && bgMedia.videoWidth > 0) { // Check videoWidth > 0
            const { drawWidth, drawHeight, offsetX, offsetY } = getContainSize(canvas.width, canvas.height, bgMedia.videoWidth, bgMedia.videoHeight);
            ctx.drawImage(bgMedia, offsetX, offsetY, drawWidth, drawHeight);
        }
    }
    
    // Draw overlay
    const ovMedia = document.getElementById('overlay-media-export') as HTMLImageElement | HTMLVideoElement;
    if (ovMedia) {
        ctx.save(); // Save context state before overlay transformations
        ctx.globalAlpha = opacity;
        
        const ovCenterX = canvas.width / 2 + positionX;
        const ovCenterY = canvas.height / 2 + positionY;
        
        ctx.translate(ovCenterX, ovCenterY);
        ctx.rotate(rotation * Math.PI / 180);
        ctx.scale(scale, scale);

        let naturalWidth = 0;
        let naturalHeight = 0;
        if (overlayType === 'image' && ovMedia instanceof HTMLImageElement && ovMedia.complete) {
            naturalWidth = ovMedia.naturalWidth;
            naturalHeight = ovMedia.naturalHeight;
        } else if (overlayType === 'video' && ovMedia instanceof HTMLVideoElement && ovMedia.videoWidth > 0) { // Check videoWidth > 0
            naturalWidth = ovMedia.videoWidth;
            naturalHeight = ovMedia.videoHeight;
        }

        if (naturalWidth > 0 && naturalHeight > 0) {
            const { drawWidth, drawHeight } = getContainSize(canvas.width, canvas.height, naturalWidth, naturalHeight);
            ctx.drawImage(ovMedia, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        }
        ctx.restore(); // Restore context state after overlay transformations
    }

    if (roundedCorners) {
      ctx.restore(); // Restore context if it was clipped
    }
  }, [backgroundType, overlayType, opacity, scale, rotation, positionX, positionY, roundedCorners]);

  const getContainSize = (containerWidth: number, containerHeight: number, naturalWidth: number, naturalHeight: number) => {
    const containerRatio = containerWidth / containerHeight;
    const naturalRatio = naturalWidth / naturalHeight;
    let drawWidth, drawHeight, offsetX = 0, offsetY = 0;

    if (naturalWidth <= 0 || naturalHeight <= 0) { // Prevent division by zero or invalid aspect ratio
        return { drawWidth: 0, drawHeight: 0, offsetX: containerWidth / 2, offsetY: containerHeight / 2 };
    }
    
    if (naturalRatio > containerRatio) { 
        drawWidth = containerWidth;
        drawHeight = containerWidth / naturalRatio;
        offsetY = (containerHeight - drawHeight) / 2;
    } else { 
        drawHeight = containerHeight;
        drawWidth = containerHeight * naturalRatio;
        offsetX = (containerWidth - drawWidth) / 2;
    }
    return { drawWidth, drawHeight, offsetX, offsetY };
  };

  const handleExportImage = useCallback(async () => {
    if (!backgroundUrl) {
      toast({ title: "Export Error", description: "Please upload a background first.", variant: "destructive" });
      return;
    }
    setIsExporting(true);
    
    const canvas = document.createElement('canvas');
    const bgMedia = document.getElementById('background-media-export') as HTMLImageElement | HTMLVideoElement;

    if (!bgMedia) {
        setIsExporting(false);
        toast({ title: "Export Error", description: "Background media element not found.", variant: "destructive" });
        return;
    }
    
    await new Promise<void>(resolve => {
      if (backgroundType === 'image' && bgMedia instanceof HTMLImageElement) {
        if (bgMedia.complete && bgMedia.naturalWidth > 0) resolve(); else bgMedia.onload = () => { if (bgMedia.naturalWidth > 0) resolve(); };
      } else if (backgroundType === 'video' && bgMedia instanceof HTMLVideoElement) {
        if (bgMedia.readyState >= 2 && bgMedia.videoWidth > 0) resolve(); else bgMedia.onloadeddata = () => { if (bgMedia.videoWidth > 0) resolve(); };
      } else {
        resolve(); 
      }
    });

    canvas.width = bgMedia instanceof HTMLVideoElement ? (bgMedia.videoWidth || 1280) : ((bgMedia as HTMLImageElement).naturalWidth || 1280);
    canvas.height = bgMedia instanceof HTMLVideoElement ? (bgMedia.videoHeight || 720) : ((bgMedia as HTMLImageElement).naturalHeight || 720);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsExporting(false);
      toast({ title: "Export Error", description: "Could not get canvas context.", variant: "destructive" });
      return;
    }

    await drawFrameOnCanvas(ctx, canvas);

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'glass-view_export.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({ title: "Export Successful", description: "Image downloaded." });
      } else {
        toast({ title: "Export Error", description: "Failed to create image blob.", variant: "destructive" });
      }
      setIsExporting(false);
    }, 'image/png');

  }, [backgroundUrl, backgroundType, drawFrameOnCanvas, toast]);

  const handleExportVideo = useCallback(async () => {
    if (!backgroundUrl || backgroundType !== 'video') {
      toast({ title: "Export Error", description: "Video export requires a video background.", variant: "destructive" });
      return;
    }
    setIsExporting(true);

    const bgVideo = document.getElementById('background-media-export') as HTMLVideoElement;
     if (!bgVideo) {
        setIsExporting(false);
        toast({ title: "Export Error", description: "Background video element not found.", variant: "destructive" });
        return;
    }
    
    await new Promise<void>(resolve => {
        if (bgVideo.readyState >= 2 && bgVideo.videoWidth > 0) resolve(); else bgVideo.onloadeddata = () => { if(bgVideo.videoWidth > 0) resolve(); };
    });

    const canvas = document.createElement('canvas');
    canvas.width = bgVideo.videoWidth || 1280;
    canvas.height = bgVideo.videoHeight || 720;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setIsExporting(false);
      toast({ title: "Export Error", description: "Could not get canvas context.", variant: "destructive" });
      return;
    }

    const stream = canvas.captureStream(30); 
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'glass-view_export.webm';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsExporting(false);
      toast({ title: "Export Successful", description: "Video downloaded." });
    };

    recorder.start();

    bgVideo.currentTime = 0;
    await bgVideo.play().catch(e => { console.error("Error playing background video:", e); setIsExporting(false); recorder.stop(); });


    const ovVideo = document.getElementById('overlay-media-export') as HTMLVideoElement;
    if (overlayType === 'video' && ovVideo) {
        ovVideo.currentTime = 0;
        await ovVideo.play().catch(e => console.error("Error playing overlay video:", e));
    }
    
    let animationFrameId: number;
    const duration = bgVideo.duration;

    function recordFrame() {
      if (!isExporting || bgVideo.currentTime >= duration || bgVideo.paused) {
        if(recorder.state === "recording") recorder.stop();
        bgVideo.pause();
        if (ovVideo) ovVideo.pause();
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        // setIsExporting(false); // Moved to onstop or error handling
        return;
      }
      drawFrameOnCanvas(ctx, canvas);
      animationFrameId = requestAnimationFrame(recordFrame);
    }
    animationFrameId = requestAnimationFrame(recordFrame);

  }, [backgroundUrl, backgroundType, overlayType, drawFrameOnCanvas, toast, isExporting]);


  const HiddenMediaForExport = () => (
    <div style={{ display: 'none' }}>
      {backgroundUrl && backgroundType === 'image' && <img id="background-media-export" src={backgroundUrl} alt="" crossOrigin="anonymous" />}
      {backgroundUrl && backgroundType === 'video' && <video id="background-media-export" src={backgroundUrl} muted playsInline crossOrigin="anonymous"/>}
      {overlayUrl && overlayType === 'image' && <img id="overlay-media-export" src={overlayUrl} alt="" crossOrigin="anonymous" />}
      {overlayUrl && overlayType === 'video' && <video id="overlay-media-export" src={overlayUrl} muted playsInline crossOrigin="anonymous"/>}
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-background text-foreground overflow-hidden">
      <aside className="w-full lg:w-[380px] p-4 lg:p-6 bg-card shadow-lg overflow-y-auto transition-all duration-300 ease-in-out shrink-0">
        <ControlsPanel
          onBackgroundChange={setBackgroundFile}
          onOverlayChange={setOverlayFile}
          opacity={opacity}
          onOpacityChange={setOpacity}
          scale={scale}
          onScaleChange={setScale}
          rotation={rotation}
          onRotationChange={setRotation}
          positionX={positionX}
          onPositionXChange={setPositionX}
          positionY={positionY}
          onPositionYChange={setPositionY}
          roundedCorners={roundedCorners}
          onRoundedCornersChange={setRoundedCorners}
          onExportImage={handleExportImage}
          onExportVideo={handleExportVideo}
          isExporting={isExporting}
        />
      </aside>

      <main className="flex-1 p-4 lg:p-6 flex items-center justify-center overflow-hidden">
        <PreviewArea
          backgroundUrl={backgroundUrl}
          backgroundType={backgroundType}
          overlayUrl={overlayUrl}
          overlayType={overlayType}
          overlayStyle={overlayStyle}
          roundedCorners={roundedCorners}
          cornerRadiusPreview={PREVIEW_CORNER_RADIUS_CSS}
        />
      </main>
      <HiddenMediaForExport />
    </div>
  );
}
