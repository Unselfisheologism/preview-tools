
'use client';

import type React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import ControlsPanel from '@/components/glass-view/controls-panel';
import PreviewArea from '@/components/glass-view/preview-area';
import { useToast } from "@/hooks/use-toast";

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

  const [isExporting, setIsExporting] = useState(false);

  const backgroundMediaRef = useRef<HTMLImageElement | HTMLVideoElement | null>(null);
  const overlayMediaRef = useRef<HTMLImageElement | HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);


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
  }, [backgroundFile]);

  useEffect(() => {
    handleFileChange(overlayFile, setOverlayUrl, setOverlayType);
    return () => {
      if (overlayUrl) URL.revokeObjectURL(overlayUrl);
    };
  }, [overlayFile]);

  const overlayStyle: React.CSSProperties = {
    opacity,
    transform: `translate(${positionX}px, ${positionY}px) scale(${scale}) rotate(${rotation}deg)`,
    width: overlayType === 'image' ? 'auto' : '100%', // Adjust as needed
    height: overlayType === 'image' ? 'auto' : '100%',
  };

  const edgeSize = 40; // Example size for curved edges

  const drawCurvedEdge = (ctx: CanvasRenderingContext2D, corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right', size: number, canvasWidth: number, canvasHeight: number) => {
    ctx.save();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.beginPath();
    const s = size;
    
    // Paths are relative to canvas origin.
    if (corner === 'top-left') {
      ctx.moveTo(0, s); 
      ctx.quadraticCurveTo(0, 0, s, 0);
    } else if (corner === 'top-right') {
      ctx.moveTo(canvasWidth - s, 0); 
      ctx.quadraticCurveTo(canvasWidth, 0, canvasWidth, s);
    } else if (corner === 'bottom-left') {
      ctx.moveTo(s, canvasHeight); 
      ctx.quadraticCurveTo(0, canvasHeight, 0, canvasHeight - s);
    } else if (corner === 'bottom-right') {
      ctx.moveTo(canvasWidth, canvasHeight - s); 
      ctx.quadraticCurveTo(canvasWidth, canvasHeight, canvasWidth - s, canvasHeight);
    }
    
    ctx.stroke();
    ctx.restore();
  };
  
  const drawFrameOnCanvas = useCallback(async (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    const bgMedia = document.getElementById('background-media-export') as HTMLImageElement | HTMLVideoElement;
    if (bgMedia) {
        if (backgroundType === 'image' && bgMedia instanceof HTMLImageElement && bgMedia.complete) {
             const { drawWidth, drawHeight, offsetX, offsetY } = getContainSize(canvas.width, canvas.height, bgMedia.naturalWidth, bgMedia.naturalHeight);
             ctx.drawImage(bgMedia, offsetX, offsetY, drawWidth, drawHeight);
        } else if (backgroundType === 'video' && bgMedia instanceof HTMLVideoElement) {
            const { drawWidth, drawHeight, offsetX, offsetY } = getContainSize(canvas.width, canvas.height, bgMedia.videoWidth, bgMedia.videoHeight);
            ctx.drawImage(bgMedia, offsetX, offsetY, drawWidth, drawHeight);
        }
    }
    
    // Draw curved edges
    drawCurvedEdge(ctx, 'top-left', edgeSize, canvas.width, canvas.height);
    drawCurvedEdge(ctx, 'top-right', edgeSize, canvas.width, canvas.height);
    drawCurvedEdge(ctx, 'bottom-left', edgeSize, canvas.width, canvas.height);
    drawCurvedEdge(ctx, 'bottom-right', edgeSize, canvas.width, canvas.height);

    // Draw overlay
    const ovMedia = document.getElementById('overlay-media-export') as HTMLImageElement | HTMLVideoElement;
    if (ovMedia) {
        ctx.save();
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
        } else if (overlayType === 'video' && ovMedia instanceof HTMLVideoElement) {
            naturalWidth = ovMedia.videoWidth;
            naturalHeight = ovMedia.videoHeight;
        }

        if (naturalWidth > 0 && naturalHeight > 0) {
            // Calculate dimensions to contain overlay within canvas, respecting its aspect ratio
            // This part is tricky with transforms. For simplicity, let's assume overlay is drawn at its natural size scaled
            // and the user positions it. Or, we can pre-scale it to fit within some bounds.
            // Max overlay dimensions can be set e.g. to canvas dimensions.
            const { drawWidth, drawHeight } = getContainSize(canvas.width, canvas.height, naturalWidth, naturalHeight);
            
            ctx.drawImage(ovMedia, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        }
        ctx.restore();
    }
  }, [backgroundType, overlayType, opacity, scale, rotation, positionX, positionY, edgeSize]);

  const getContainSize = (containerWidth: number, containerHeight: number, naturalWidth: number, naturalHeight: number) => {
    const containerRatio = containerWidth / containerHeight;
    const naturalRatio = naturalWidth / naturalHeight;
    let drawWidth, drawHeight, offsetX = 0, offsetY = 0;

    if (naturalRatio > containerRatio) { // Wider than container
        drawWidth = containerWidth;
        drawHeight = containerWidth / naturalRatio;
        offsetY = (containerHeight - drawHeight) / 2;
    } else { // Taller than or same ratio as container
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
    
    // Wait for media to load dimensions
    await new Promise<void>(resolve => {
      if (backgroundType === 'image' && bgMedia instanceof HTMLImageElement) {
        if (bgMedia.complete) resolve(); else bgMedia.onload = () => resolve();
      } else if (backgroundType === 'video' && bgMedia instanceof HTMLVideoElement) {
        if (bgMedia.readyState >= 2) resolve(); else bgMedia.onloadeddata = () => resolve();
      } else {
        resolve(); // No background, or unknown type
      }
    });

    canvas.width = bgMedia instanceof HTMLVideoElement ? bgMedia.videoWidth : (bgMedia as HTMLImageElement).naturalWidth || 1280;
    canvas.height = bgMedia instanceof HTMLVideoElement ? bgMedia.videoHeight : (bgMedia as HTMLImageElement).naturalHeight || 720;
    
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
        if (bgVideo.readyState >= 2) resolve(); else bgVideo.onloadeddata = () => resolve();
    });

    const canvas = document.createElement('canvas');
    canvas.width = bgVideo.videoWidth;
    canvas.height = bgVideo.videoHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setIsExporting(false);
      toast({ title: "Export Error", description: "Could not get canvas context.", variant: "destructive" });
      return;
    }

    const stream = canvas.captureStream(30); // 30 FPS
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
    await bgVideo.play();

    const ovVideo = document.getElementById('overlay-media-export') as HTMLVideoElement;
    if (overlayType === 'video' && ovVideo) {
        ovVideo.currentTime = 0;
        await ovVideo.play();
    }
    
    let animationFrameId: number;
    const duration = bgVideo.duration;

    function recordFrame() {
      if (bgVideo.currentTime >= duration || bgVideo.paused) {
        recorder.stop();
        bgVideo.pause();
        if (ovVideo) ovVideo.pause();
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        return;
      }
      drawFrameOnCanvas(ctx, canvas);
      animationFrameId = requestAnimationFrame(recordFrame);
    }
    animationFrameId = requestAnimationFrame(recordFrame);

  }, [backgroundUrl, backgroundType, overlayType, drawFrameOnCanvas, toast]);


  // Hidden media elements for export rendering
  const HiddenMediaForExport = () => (
    <div style={{ display: 'none' }}>
      {backgroundUrl && backgroundType === 'image' && <img id="background-media-export" src={backgroundUrl} alt="" />}
      {backgroundUrl && backgroundType === 'video' && <video id="background-media-export" src={backgroundUrl} muted playsInline />}
      {overlayUrl && overlayType === 'image' && <img id="overlay-media-export" src={overlayUrl} alt="" />}
      {overlayUrl && overlayType === 'video' && <video id="overlay-media-export" src={overlayUrl} muted playsInline />}
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
          edgeSize={edgeSize}
        />
      </main>
      <HiddenMediaForExport />
    </div>
  );
}
