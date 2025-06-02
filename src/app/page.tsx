
'use client';

import type React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import OverlayControls from '@/components/glass-view/overlay-controls';
import BackgroundExportControls from '@/components/glass-view/background-export-controls';
import PreviewArea from '@/components/glass-view/preview-area';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Image as ImageIconLucide, Video } from 'lucide-react';

const EXPORT_CORNER_RADIUS = 30; 
const PREVIEW_CORNER_RADIUS_CSS = '20px'; 
const BROWSER_BAR_HEIGHT_CHROME_PX = 56;
const BROWSER_BAR_HEIGHT_SAFARI_PX = 44;

interface DefaultBackground {
  name: string;
  url: string;
  hint: string;
}

const defaultBackgrounds: DefaultBackground[] = [
  { name: 'Desk Setup', url: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1748847957/Image_fx_6_nj1uag.png', hint: 'desk setup' },
  { name: 'Mountain View', url: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1748847959/Image_fx_5_ycbk1t.png', hint: 'mountain view' },
  { name: 'Urban Cafe', url: 'https://res.cloudinary.com/ddz3nsnq1/image/upload/v1748847938/loutput_i6pat1.jpg', hint: 'urban cafe' },
];


export default function GlassViewPage() {
  const { toast } = useToast();

  // Background State
  const [backgroundMode, setBackgroundMode] = useState<'default' | 'custom' | 'solid' | 'transparent'>('default');
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(defaultBackgrounds[0].url);
  const [backgroundType, setBackgroundType] = useState<'image' | 'video' | null>('image');
  const [backgroundHint, setBackgroundHint] = useState<string | null>(defaultBackgrounds[0].hint);
  const [solidBackgroundColor, setSolidBackgroundColor] = useState<string>('#FFFFFF');

  // Background Effects State
  const [backgroundEffectBlur, setBackgroundEffectBlur] = useState(0); // 0-20
  const [backgroundEffectBrightness, setBackgroundEffectBrightness] = useState(1); // 0-2, step 0.1
  const [backgroundEffectContrast, setBackgroundEffectContrast] = useState(1); // 0-2, step 0.1
  const [backgroundEffectSaturation, setBackgroundEffectSaturation] = useState(1); // 0-2, step 0.1
  const [backgroundEffectVignette, setBackgroundEffectVignette] = useState(0); // 0-1, step 0.05
  const [activeVfx, setActiveVfx] = useState<'none' | 'cornerGlow'>('none');

  // Overlay State
  const [overlayFile, setOverlayFile] = useState<File | null>(null);
  const [overlayUrl, setOverlayUrl] = useState<string | null>(null);
  const [overlayType, setOverlayType] = useState<'image' | 'video' | null>(null);
  const [opacity, setOpacity] = useState(0.7);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [blurIntensity, setBlurIntensity] = useState(0);
  
  const [overlayPosition, setOverlayPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPoint, setDragStartPoint] = useState<{ initialMouseX: number, initialMouseY: number, initialOverlayX: number, initialOverlayY: number } | null>(null);

  const [roundedCorners, setRoundedCorners] = useState(false);
  const [browserBar, setBrowserBar] = useState<'none' | 'chrome' | 'safari'>('none');
  const [browserUrlText, setBrowserUrlText] = useState('example.com');

  const [isExporting, setIsExporting] = useState(false);

  const getCurrentBrowserBarHeight = useCallback(() => {
    if (browserBar === 'chrome') return BROWSER_BAR_HEIGHT_CHROME_PX;
    if (browserBar === 'safari') return BROWSER_BAR_HEIGHT_SAFARI_PX;
    return 0;
  }, [browserBar]);

  const handleBackgroundFileChange = (file: File | null) => {
    setBackgroundFile(file);
    if (file) {
      setBackgroundMode('custom');
    }
  };

  useEffect(() => {
    let objectUrl: string | null = null;
    if (backgroundFile && backgroundMode === 'custom') {
      objectUrl = URL.createObjectURL(backgroundFile);
      setBackgroundUrl(objectUrl);
      setBackgroundType(backgroundFile.type.startsWith('image/') ? 'image' : 'video');
      setBackgroundHint('custom background');
    } else if (backgroundMode !== 'custom') {
      // Revoke if mode changes away from custom and there was a file
      const currentCustomUrl = backgroundFile ? URL.createObjectURL(backgroundFile) : null;
      if (currentCustomUrl && backgroundUrl === currentCustomUrl) {
         URL.revokeObjectURL(currentCustomUrl);
      }
    }
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [backgroundFile, backgroundMode, backgroundUrl]);


  const handleSetDefaultBackground = (defaultBg: DefaultBackground) => {
    setBackgroundMode('default');
    setBackgroundFile(null); 
    setBackgroundUrl(defaultBg.url);
    setBackgroundType('image');
    setBackgroundHint(defaultBg.hint);
  };
  
  useEffect(() => {
    if (backgroundMode === 'solid' || backgroundMode === 'transparent') {
      setBackgroundUrl(null);
      setBackgroundType(null);
      setBackgroundHint(backgroundMode === 'solid' ? 'solid color' : 'transparent background');
    } else if (backgroundMode === 'default' && !backgroundUrl && defaultBackgrounds.length > 0) {
        handleSetDefaultBackground(defaultBackgrounds[0]);
    }
  }, [backgroundMode, backgroundUrl]);


  const handleOverlayFileChange = (file: File | null) => {
    setOverlayFile(file);
  };

  useEffect(() => {
    let newUrl: string | null = null;
    if (overlayFile) {
      newUrl = URL.createObjectURL(overlayFile);
      setOverlayUrl(newUrl);
      setOverlayType(overlayFile.type.startsWith('image/') ? 'image' : 'video');
    }
    return () => {
      if (newUrl) {
        URL.revokeObjectURL(newUrl);
      }
    };
  }, [overlayFile]);


  const handleOverlayMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault(); 
    setIsDragging(true);
    setDragStartPoint({
      initialMouseX: event.clientX,
      initialMouseY: event.clientY,
      initialOverlayX: overlayPosition.x,
      initialOverlayY: overlayPosition.y,
    });
  };

  useEffect(() => {
    const handleGlobalMouseMove = (event: MouseEvent) => {
      if (isDragging && dragStartPoint) {
        const deltaX = event.clientX - dragStartPoint.initialMouseX;
        const deltaY = event.clientY - dragStartPoint.initialMouseY;
        setOverlayPosition({
          x: dragStartPoint.initialOverlayX + deltaX,
          y: dragStartPoint.initialOverlayY + deltaY,
        });
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setDragStartPoint(null);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, dragStartPoint]);

  const overlayStyle: React.CSSProperties = {
    opacity: opacity,
    transform: `translate(${overlayPosition.x}px, ${overlayPosition.y}px) scale(${scale}) rotate(${rotation}deg)`,
    filter: blurIntensity > 0 ? `blur(${blurIntensity}px)` : 'none',
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  };
  
  const drawFrameOnCanvas = useCallback(async (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const currentBrowserBarHeight = getCurrentBrowserBarHeight();

    // Rounded corners for the entire canvas output if enabled
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

    // 1. Draw Background (Solid, Transparent, or Image/Video)
    if (backgroundMode === 'solid') {
      ctx.fillStyle = solidBackgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (backgroundMode === 'transparent') {
      // Transparent: do nothing, or fill with a specific color if target format needs it (PNG is fine)
      // Forcing a white background if format doesn't support alpha well, but toBlob as PNG should be fine.
      // ctx.fillStyle = 'rgba(0,0,0,0)'; // Explicitly clear or ensure it's clear
      // ctx.clearRect(0,0,canvas.width,canvas.height); // Already done at the start
    } else if ((backgroundMode === 'custom' || backgroundMode === 'default') && backgroundUrl) {
      const bgMedia = document.getElementById('background-media-export') as HTMLImageElement | HTMLVideoElement;
      if (bgMedia) {
        ctx.save(); // Save before applying filters to background
        const filters = [];
        if (backgroundEffectBlur > 0) filters.push(`blur(${backgroundEffectBlur}px)`);
        if (backgroundEffectBrightness !== 1) filters.push(`brightness(${backgroundEffectBrightness})`);
        if (backgroundEffectContrast !== 1) filters.push(`contrast(${backgroundEffectContrast})`);
        if (backgroundEffectSaturation !== 1) filters.push(`saturate(${backgroundEffectSaturation})`);
        if (filters.length > 0) ctx.filter = filters.join(' ');

        if (backgroundType === 'image' && bgMedia instanceof HTMLImageElement && bgMedia.complete) {
             const { drawWidth, drawHeight, offsetX, offsetY } = getContainSize(canvas.width, canvas.height, bgMedia.naturalWidth, bgMedia.naturalHeight);
             ctx.drawImage(bgMedia, offsetX, offsetY, drawWidth, drawHeight);
        } else if (backgroundType === 'video' && bgMedia instanceof HTMLVideoElement && bgMedia.videoWidth > 0) {
            const { drawWidth, drawHeight, offsetX, offsetY } = getContainSize(canvas.width, canvas.height, bgMedia.videoWidth, bgMedia.videoHeight);
            ctx.drawImage(bgMedia, offsetX, offsetY, drawWidth, drawHeight);
        }
        ctx.restore(); // Restore after drawing filtered background
      }
    }

    // 2. Draw VFX and Vignette over the background
    if (activeVfx === 'cornerGlow') {
      ctx.save();
      const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(canvas.width, canvas.height) * 0.6);
      glowGradient.addColorStop(0, 'rgba(255, 255, 220, 0.3)');
      glowGradient.addColorStop(1, 'rgba(255, 255, 220, 0)');
      ctx.fillStyle = glowGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }

    if (backgroundEffectVignette > 0) {
      ctx.save();
      const vignetteGradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, canvas.width * 0.2, canvas.width / 2, canvas.height / 2, canvas.width * 0.7);
      vignetteGradient.addColorStop(0, 'rgba(0,0,0,0)');
      vignetteGradient.addColorStop(1, `rgba(0,0,0,${backgroundEffectVignette})`);
      ctx.fillStyle = vignetteGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
    
    // 3. Draw Overlay (Screenshot/Recording with its own effects)
    // Outer save for opacity and main overlay filter (blurIntensity)
    ctx.save(); 
    ctx.globalAlpha = opacity;
    if (blurIntensity > 0) {
      ctx.filter = `blur(${blurIntensity}px)`;
    }

    // Inner save for transformations (translate, rotate, scale) of the overlay content
    ctx.save(); 
    const groupCenterX = canvas.width / 2 + overlayPosition.x;
    const groupCenterY = canvas.height / 2 + overlayPosition.y; 
    
    ctx.translate(groupCenterX, groupCenterY);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.scale(scale, scale);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);


    if (browserBar !== 'none') {
      const barHeight = currentBrowserBarHeight; 
      ctx.fillStyle = browserBar === 'chrome' ? '#DADCE0' : '#F0F0F0'; 
      ctx.fillRect(0, 0, canvas.width, barHeight);

      ctx.fillStyle = '#FF5F57'; 
      ctx.beginPath(); ctx.arc(12 + (canvas.width > 300 ? 0 : -2), barHeight / 2, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FEBC2E'; 
      ctx.beginPath(); ctx.arc(32 + (canvas.width > 300 ? 0 : -2), barHeight / 2, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#28C840'; 
      ctx.beginPath(); ctx.arc(52 + (canvas.width > 300 ? 0 : -2), barHeight / 2, 6, 0, Math.PI * 2); ctx.fill();
      
      const urlBarX = canvas.width > 300 ? 80 : 60;
      const urlBarY = barHeight / 2 - 10;
      const urlBarWidth = canvas.width - urlBarX - (canvas.width > 300 ? 20 : 10);
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
            
            const { drawWidth, drawHeight, offsetX } = getContainSize(
                canvas.width, 
                overlayContentHeight,
                naturalWidth, 
                naturalHeight
            );
            // Ensure content is not drawn outside the canvas boundaries due to scaling/rotation before clipping
            if (drawWidth > 0 && drawHeight > 0) {
                 ctx.drawImage(ovMedia, offsetX, overlayContentY, drawWidth, drawHeight);
            }
        }
    }
    
    ctx.restore(); // Restores overlay transform (translate, rotate, scale)
    ctx.restore(); // Restores overlay group's globalAlpha and main filter (blurIntensity)

    // Restore clipping path if rounded corners were applied
    if (roundedCorners) {
      ctx.restore(); 
    }
  }, [
      backgroundMode, solidBackgroundColor, backgroundUrl, backgroundType,
      backgroundEffectBlur, backgroundEffectBrightness, backgroundEffectContrast, backgroundEffectSaturation,
      backgroundEffectVignette, activeVfx,
      overlayType, 
      opacity, scale, rotation, blurIntensity,
      overlayPosition, 
      roundedCorners, browserBar, browserUrlText,
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
    if (backgroundMode === 'default' || backgroundMode === 'custom') {
      if (!backgroundUrl) {
         toast({ title: "Export Error", description: "Please select or upload a background image/video first for this mode.", variant: "destructive" });
         return;
      }
    }
    setIsExporting(true);
    
    const canvas = document.createElement('canvas');
    let exportWidth = 1280; // default
    let exportHeight = 720; // default

    if ((backgroundMode === 'default' || backgroundMode === 'custom') && backgroundUrl) {
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
        exportWidth = bgMedia instanceof HTMLVideoElement ? (bgMedia.videoWidth || 1280) : ((bgMedia as HTMLImageElement).naturalWidth || 1280);
        exportHeight = bgMedia instanceof HTMLVideoElement ? (bgMedia.videoHeight || 720) : ((bgMedia as HTMLImageElement).naturalHeight || 720);
    } else if (overlayUrl) { // Base size on overlay if no background image/video
        const ovMedia = document.getElementById('overlay-media-export') as HTMLImageElement | HTMLVideoElement;
         if (ovMedia) {
            await new Promise<void>(resolve => {
                if (overlayType === 'image' && ovMedia instanceof HTMLImageElement) {
                    if (ovMedia.complete && ovMedia.naturalWidth > 0) resolve(); else ovMedia.onload = () => { if (ovMedia.naturalWidth > 0) resolve(); };
                } else if (overlayType === 'video' && ovMedia instanceof HTMLVideoElement) {
                    if (ovMedia.readyState >= 2 && ovMedia.videoWidth > 0) resolve(); else ovMedia.onloadeddata = () => { if (ovMedia.videoWidth > 0) resolve(); };
                } else { resolve(); }
            });
            exportWidth = ovMedia instanceof HTMLVideoElement ? (ovMedia.videoWidth || 1280) : ((ovMedia as HTMLImageElement).naturalWidth || 1280);
            exportHeight = ovMedia instanceof HTMLVideoElement ? (ovMedia.videoHeight || 720) : ((ovMedia as HTMLImageElement).naturalHeight || 720);
        }
    }


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

  }, [
    backgroundMode, backgroundUrl, backgroundType, solidBackgroundColor,
    drawFrameOnCanvas, toast, overlayUrl, overlayType
  ]);

  const handleExportVideo = useCallback(async () => {
    if (backgroundMode !== 'custom' && backgroundMode !== 'default' || backgroundType !== 'video' || !backgroundUrl) {
      toast({ title: "Export Error", description: "Video export currently requires a video background uploaded or selected from defaults.", variant: "destructive" });
      setIsExporting(false); // Ensure exporting state is reset
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
       // Ensure videos are paused after recording stops
      bgVideo.pause();
      const ovVideo = document.getElementById('overlay-media-export') as HTMLVideoElement;
      if (ovVideo) ovVideo.pause();
    };
     recorder.onerror = (event) => {
      console.error("MediaRecorder error:", event);
      toast({ title: "Export Error", description: `Video recording failed. ${ (event as any)?.error?.message || '' }`, variant: "destructive" });
      setIsExporting(false);
      bgVideo.pause();
      const ovVideo = document.getElementById('overlay-media-export') as HTMLVideoElement;
      if (ovVideo) ovVideo.pause();
    };


    recorder.start();

    bgVideo.currentTime = 0;
    await bgVideo.play().catch(e => { 
        console.error("Error playing background video:", e); 
        setIsExporting(false); 
        if(recorder.state === "recording") recorder.stop(); 
        toast({title: "Playback Error", description: "Could not play background video for export.", variant: "destructive"})
    });


    const ovVideo = document.getElementById('overlay-media-export') as HTMLVideoElement;
    if (overlayType === 'video' && ovVideo) {
        ovVideo.currentTime = 0;
        await ovVideo.play().catch(e => console.error("Error playing overlay video:", e));
    }
    
    let animationFrameId: number;
    const duration = bgVideo.duration;


    function recordFrame() {
      // Check if exporting was cancelled or video ended/paused
      if (!isExporting || bgVideo.currentTime >= duration || bgVideo.paused) {
        if(recorder.state === "recording") recorder.stop();
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        // setIsExporting(false); // This is handled in onstop/onerror
        return;
      }
      drawFrameOnCanvas(ctx, canvas);
      animationFrameId = requestAnimationFrame(recordFrame);
    }
    animationFrameId = requestAnimationFrame(recordFrame);

  }, [
    backgroundMode, backgroundUrl, backgroundType, overlayType, 
    drawFrameOnCanvas, toast, isExporting // Added isExporting
 ]);


  const HiddenMediaForExport = () => (
    <div style={{ display: 'none' }}>
      {backgroundUrl && (backgroundMode === 'default' || backgroundMode === 'custom') && backgroundType === 'image' && <img id="background-media-export" src={backgroundUrl} alt="background export" crossOrigin="anonymous" />}
      {backgroundUrl && (backgroundMode === 'default' || backgroundMode === 'custom') && backgroundType === 'video' && <video id="background-media-export" src={backgroundUrl} muted playsInline crossOrigin="anonymous"/>}
      {overlayUrl && overlayType === 'image' && <img id="overlay-media-export" src={overlayUrl} alt="overlay export" crossOrigin="anonymous" />}
      {overlayUrl && overlayType === 'video' && <video id="overlay-media-export" src={overlayUrl} muted playsInline crossOrigin="anonymous"/>}
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <div className="flex flex-row flex-1 overflow-hidden">
        <aside className="w-full lg:w-[350px] p-4 lg:p-6 bg-card shadow-lg overflow-y-auto transition-all duration-300 ease-in-out shrink-0">
          <OverlayControls
            onOverlayChange={handleOverlayFileChange}
            opacity={opacity}
            onOpacityChange={setOpacity}
            scale={scale}
            onScaleChange={setScale}
            rotation={rotation}
            onRotationChange={setRotation}
            blurIntensity={blurIntensity}
            onBlurIntensityChange={setBlurIntensity}
            roundedCorners={roundedCorners}
            onRoundedCornersChange={setRoundedCorners}
            browserBar={browserBar}
            onBrowserBarChange={setBrowserBar}
            browserUrl={browserUrlText}
            onBrowserUrlChange={setBrowserUrlText}
          />
        </aside>

        <main className="flex-1 p-4 lg:p-6 flex items-center justify-center overflow-hidden">
          <PreviewArea
            backgroundMode={backgroundMode}
            backgroundUrl={backgroundUrl}
            backgroundType={backgroundType}
            backgroundHint={backgroundHint}
            solidBackgroundColor={solidBackgroundColor}
            backgroundEffectBlur={backgroundEffectBlur}
            backgroundEffectBrightness={backgroundEffectBrightness}
            backgroundEffectContrast={backgroundEffectContrast}
            backgroundEffectSaturation={backgroundEffectSaturation}
            backgroundEffectVignette={backgroundEffectVignette}
            activeVfx={activeVfx}

            overlayUrl={overlayUrl}
            overlayType={overlayType}
            overlayStyle={overlayStyle}
            roundedCorners={roundedCorners}
            cornerRadiusPreview={PREVIEW_CORNER_RADIUS_CSS}
            browserBar={browserBar}
            browserUrl={browserUrlText}
            browserBarHeightChrome={BROWSER_BAR_HEIGHT_CHROME_PX}
            browserBarHeightSafari={BROWSER_BAR_HEIGHT_SAFARI_PX}
            onOverlayMouseDown={handleOverlayMouseDown}
            isDragging={isDragging}
          />
        </main>
        
        <aside className="w-full lg:w-[350px] p-4 lg:p-6 bg-card shadow-lg overflow-y-auto transition-all duration-300 ease-in-out shrink-0">
          <BackgroundExportControls
            defaultBackgrounds={defaultBackgrounds}
            onSetDefaultBackground={handleSetDefaultBackground}
            onBackgroundChange={handleBackgroundFileChange}
            
            backgroundMode={backgroundMode}
            onBackgroundModeChange={setBackgroundMode}
            solidBackgroundColor={solidBackgroundColor}
            onSolidBackgroundColorChange={setSolidBackgroundColor}
            
            backgroundEffectBlur={backgroundEffectBlur}
            onBackgroundEffectBlurChange={setBackgroundEffectBlur}
            backgroundEffectBrightness={backgroundEffectBrightness}
            onBackgroundEffectBrightnessChange={setBackgroundEffectBrightness}
            backgroundEffectContrast={backgroundEffectContrast}
            onBackgroundEffectContrastChange={setBackgroundEffectContrast}
            backgroundEffectSaturation={backgroundEffectSaturation}
            onBackgroundEffectSaturationChange={setBackgroundEffectSaturation}
            backgroundEffectVignette={backgroundEffectVignette}
            onBackgroundEffectVignetteChange={setBackgroundEffectVignette}
            activeVfx={activeVfx}
            onActiveVfxChange={setActiveVfx}
          />
        </aside>
      </div>
      
      <footer className="p-4 lg:p-6 flex justify-center border-t border-border bg-card">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              Export Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleExportImage} className="w-full" disabled={isExporting}>
              {isExporting ? 'Exporting Image...' : 'Export as Image'}
              <ImageIconLucide className="ml-2 h-4 w-4" />
            </Button>
            <Button onClick={handleExportVideo} variant="outline" className="w-full" disabled={isExporting || !((backgroundMode === 'default' || backgroundMode === 'custom') && backgroundType === 'video')}>
              {isExporting && ((backgroundMode === 'default' || backgroundMode === 'custom') && backgroundType === 'video') ? 'Exporting Video...' : 'Export as Video'}
              <Video className="ml-2 h-4 w-4" />
            </Button>
             {!((backgroundMode === 'default' || backgroundMode === 'custom') && backgroundType === 'video') && (
                <p className="text-xs text-muted-foreground text-center">Video export requires a video background (default or custom).</p>
            )}
          </CardContent>
        </Card>
      </footer>
      <HiddenMediaForExport />
    </div>
  );
}
    
    
