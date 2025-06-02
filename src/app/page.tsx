
'use client';

import type React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import ControlsPanel from '@/components/glass-view/controls-panel';
import PreviewArea from '@/components/glass-view/preview-area';
import { useToast } from "@/hooks/use-toast";
import { ChromeBar } from '@/components/glass-view/browser-bars/chrome-bar';
import { SafariBar } from '@/components/glass-view/browser-bars/safari-bar';


const EXPORT_CORNER_RADIUS = 30; // For canvas export
const PREVIEW_CORNER_RADIUS_CSS = '20px'; // For CSS preview
const BROWSER_BAR_HEIGHT_CHROME_PX = 56;
const BROWSER_BAR_HEIGHT_SAFARI_PX = 44;


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
  const [browserBar, setBrowserBar] = useState<'none' | 'chrome' | 'safari'>('none');
  const [browserUrlText, setBrowserUrlText] = useState('example.com');


  const [isExporting, setIsExporting] = useState(false);

  const getCurrentBrowserBarHeight = useCallback(() => {
    if (browserBar === 'chrome') return BROWSER_BAR_HEIGHT_CHROME_PX;
    if (browserBar === 'safari') return BROWSER_BAR_HEIGHT_SAFARI_PX;
    return 0;
  }, [browserBar]);


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
    opacity: opacity,
    transform: `translate(${positionX}px, ${positionY}px) scale(${scale}) rotate(${rotation}deg)`,
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  };
  
  const drawFrameOnCanvas = useCallback(async (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const currentBrowserBarHeight = getCurrentBrowserBarHeight();

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

    const bgMedia = document.getElementById('background-media-export') as HTMLImageElement | HTMLVideoElement;
    if (bgMedia) {
        if (backgroundType === 'image' && bgMedia instanceof HTMLImageElement && bgMedia.complete) {
             const { drawWidth, drawHeight, offsetX, offsetY } = getContainSize(canvas.width, canvas.height, bgMedia.naturalWidth, bgMedia.naturalHeight);
             ctx.drawImage(bgMedia, offsetX, offsetY, drawWidth, drawHeight);
        } else if (backgroundType === 'video' && bgMedia instanceof HTMLVideoElement && bgMedia.videoWidth > 0) {
            const { drawWidth, drawHeight, offsetX, offsetY } = getContainSize(canvas.width, canvas.height, bgMedia.videoWidth, bgMedia.videoHeight);
            ctx.drawImage(bgMedia, offsetX, offsetY, drawWidth, drawHeight);
        }
    }
    
    ctx.save();
    const groupCenterX = canvas.width / 2 + positionX;
    const groupCenterY = canvas.height / 2 + positionY; 
    
    ctx.translate(groupCenterX, groupCenterY);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.scale(scale, scale);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);


    if (browserBar !== 'none') {
      const barHeight = currentBrowserBarHeight; 
      ctx.fillStyle = browserBar === 'chrome' ? '#DADCE0' : '#F0F0F0'; // Simplified, replace with actual bar drawing if complex
      ctx.fillRect(0, 0, canvas.width, barHeight);

      ctx.fillStyle = '#FF5F57'; 
      ctx.beginPath(); ctx.arc(12, barHeight / 2, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FEBC2E'; 
      ctx.beginPath(); ctx.arc(32, barHeight / 2, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#28C840'; 
      ctx.beginPath(); ctx.arc(52, barHeight / 2, 6, 0, Math.PI * 2); ctx.fill();
      
      const urlBarX = 80;
      const urlBarY = barHeight / 2 - 10;
      const urlBarWidth = canvas.width - urlBarX - 20;
      const urlBarHeight = 20;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(urlBarX, urlBarY, urlBarWidth, urlBarHeight);
      
      ctx.fillStyle = '#333333';
      ctx.font = '12px Inter';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(browserUrlText, urlBarX + 10, urlBarY + urlBarHeight / 2, urlBarWidth - 20);
    }

    const ovMedia = document.getElementById('overlay-media-export') as HTMLImageElement | HTMLVideoElement;
    if (ovMedia) {
        // Opacity is handled by overlayStyle on the main transformation group
        // ctx.globalAlpha = opacity; // This was moved
        
        let naturalWidth = 0;
        let naturalHeight = 0;
        if (overlayType === 'image' && ovMedia instanceof HTMLImageElement && ovMedia.complete) {
            naturalWidth = ovMedia.naturalWidth;
            naturalHeight = ovMedia.naturalHeight;
        } else if (overlayType === 'video' && ovMedia instanceof HTMLVideoElement && ovMedia.videoWidth > 0) {
            naturalWidth = ovMedia.videoWidth;
            naturalHeight = ovMedia.videoHeight;
        }

        if (naturalWidth > 0 && naturalHeight > 0) {
            const overlayContentY = browserBar !== 'none' ? currentBrowserBarHeight : 0;
            const overlayContentHeight = canvas.height - overlayContentY;
            
            const { drawWidth, drawHeight, offsetX } = getContainSize( // offsetY from getContainSize is ignored for y-positioning
                canvas.width, 
                overlayContentHeight,
                naturalWidth, 
                naturalHeight
            );
            ctx.drawImage(ovMedia, offsetX, overlayContentY, drawWidth, drawHeight); // Use overlayContentY directly
        }
    }
    
    ctx.restore(); 

    if (roundedCorners) {
      ctx.restore(); 
    }
  }, [
      backgroundType, 
      overlayType, 
      opacity, 
      scale, 
      rotation, 
      positionX, 
      positionY, 
      roundedCorners, 
      browserBar, 
      browserUrlText,
      getCurrentBrowserBarHeight
    ]);

  const getContainSize = (containerWidth: number, containerHeight: number, naturalWidth: number, naturalHeight: number) => {
    if (naturalWidth <= 0 || naturalHeight <= 0 || containerWidth <= 0 || containerHeight <= 0) {
        return { drawWidth: 0, drawHeight: 0, offsetX: containerWidth / 2, offsetY: containerHeight / 2 };
    }
    
    const containerRatio = containerWidth / containerHeight;
    const naturalRatio = naturalWidth / naturalHeight;
    let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
    
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

    const exportWidth = bgMedia instanceof HTMLVideoElement ? (bgMedia.videoWidth || 1280) : ((bgMedia as HTMLImageElement).naturalWidth || 1280);
    const exportHeight = bgMedia instanceof HTMLVideoElement ? (bgMedia.videoHeight || 720) : ((bgMedia as HTMLImageElement).naturalHeight || 720);
    
    canvas.width = exportWidth;
    canvas.height = exportHeight;
    
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
    const exportWidth = bgVideo.videoWidth || 1280;
    const exportHeight = bgVideo.videoHeight || 720;

    canvas.width = exportWidth;
    canvas.height = exportHeight;
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
    await bgVideo.play().catch(e => { console.error("Error playing background video:", e); setIsExporting(false); if(recorder.state === "recording") recorder.stop(); });


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
        return;
      }
      drawFrameOnCanvas(ctx, canvas);
      animationFrameId = requestAnimationFrame(recordFrame);
    }
    animationFrameId = requestAnimationFrame(recordFrame);

  }, [backgroundUrl, backgroundType, overlayType, drawFrameOnCanvas, toast, isExporting]);


  const HiddenMediaForExport = () => (
    <div style={{ display: 'none' }}>
      {backgroundUrl && backgroundType === 'image' && <img id="background-media-export" src={backgroundUrl} alt="background export" crossOrigin="anonymous" />}
      {backgroundUrl && backgroundType === 'video' && <video id="background-media-export" src={backgroundUrl} muted playsInline crossOrigin="anonymous"/>}
      {overlayUrl && overlayType === 'image' && <img id="overlay-media-export" src={overlayUrl} alt="overlay export" crossOrigin="anonymous" />}
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
          browserBar={browserBar}
          onBrowserBarChange={setBrowserBar}
          browserUrl={browserUrlText}
          onBrowserUrlChange={setBrowserUrlText}
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
          opacity={opacity} // This is now the master opacity for the group
          roundedCorners={roundedCorners}
          cornerRadiusPreview={PREVIEW_CORNER_RADIUS_CSS}
          browserBar={browserBar}
          browserUrl={browserUrlText}
          browserBarHeightChrome={BROWSER_BAR_HEIGHT_CHROME_PX}
          browserBarHeightSafari={BROWSER_BAR_HEIGHT_SAFARI_PX}
        />
      </main>
      <HiddenMediaForExport />
    </div>
  );
}

    