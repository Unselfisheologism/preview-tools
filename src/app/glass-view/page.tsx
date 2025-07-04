
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
  const [backgroundEffectNoise, setBackgroundEffectNoise] = useState(0); // 0-1, step 0.05
  const [activeVfx, setActiveVfx] = useState<'none' | 'cornerGlow'>('none');
  const noiseCanvasRef = useRef<HTMLCanvasElement | null>(null);


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
  const animationFrameIdRef = useRef<number | undefined>();


  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const imageData = ctx.createImageData(100, 100);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const val = Math.floor(Math.random() * 255);
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
        data[i + 3] = 255;
      }
      ctx.putImageData(imageData, 0, 0);
      noiseCanvasRef.current = canvas;
    }
  }, []);

  const getCurrentBrowserBarHeight = useCallback(() => {
    if (browserBar === 'none') return 0;
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

  const handleSetDefaultBackground = useCallback((defaultBg: DefaultBackground) => {
    setBackgroundMode('default');
    setBackgroundFile(null); // Clear any custom file
    setBackgroundUrl(defaultBg.url);
    setBackgroundType('image'); // Assuming defaults are images
    setBackgroundHint(defaultBg.hint);
  }, []);


  useEffect(() => {
    let objectUrl: string | null = null;
    if (backgroundFile && backgroundMode === 'custom') {
      objectUrl = URL.createObjectURL(backgroundFile);
      setBackgroundUrl(objectUrl);
      setBackgroundType(backgroundFile.type.startsWith('image/') ? 'image' : 'video');
      setBackgroundHint('custom background');
    }
    // Only revoke if this effect created the URL
    return () => {
      if (objectUrl && backgroundMode === 'custom') {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [backgroundFile, backgroundMode]);

  useEffect(() => {
    const currentBackgroundUrlIsBlob = backgroundUrl?.startsWith('blob:') ?? false;

    if (backgroundMode === 'solid' || backgroundMode === 'transparent') {
      if (currentBackgroundUrlIsBlob && backgroundUrl) {
         URL.revokeObjectURL(backgroundUrl);
      }
      setBackgroundUrl(null);
      setBackgroundType(null);
      setBackgroundHint(backgroundMode === 'solid' ? 'solid color' : 'transparent background');
    } else if (backgroundMode === 'default') {
      // If current URL is a blob (from a previous 'custom' mode), revoke it.
      if (currentBackgroundUrlIsBlob && backgroundUrl) {
        URL.revokeObjectURL(backgroundUrl);
      }
      // Ensure a default background is set if none is, or if current isn't a default
      const isCurrentBackgroundDefault = defaultBackgrounds.some(db => db.url === backgroundUrl);
      if (!isCurrentBackgroundDefault || !backgroundUrl) {
         if (defaultBackgrounds.length > 0) {
            handleSetDefaultBackground(defaultBackgrounds[0]);
         }
      }
    }
  }, [backgroundMode, handleSetDefaultBackground, backgroundUrl]); // Removed defaultBackgrounds from here, handleSetDefaultBackground has it


  const handleOverlayFileChange = (file: File | null) => {
    setOverlayFile(file);
  };

  useEffect(() => {
    let newUrl: string | null = null;
    if (overlayFile) {
      newUrl = URL.createObjectURL(overlayFile);
      setOverlayUrl(newUrl);
      setOverlayType(overlayFile.type.startsWith('image/') ? 'image' : 'video');
    } else {
      setOverlayUrl(null);
      setOverlayType(null);
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
    cursor: isDragging ? 'grabbing' : 'grab',
    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
    willChange: 'transform, opacity, filter',
  };
  if (isDragging) {
    delete overlayStyle.transition;
  }


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

    // Draw Background
    if (backgroundMode === 'solid') {
      ctx.fillStyle = solidBackgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (backgroundMode === 'transparent') {
      // Canvas is already clear for transparency
    } else if ((backgroundMode === 'custom' || backgroundMode === 'default') && backgroundUrl) {
      const bgMedia = document.getElementById('background-media-export') as HTMLImageElement | HTMLVideoElement;
      if (bgMedia) {
        ctx.save();
        const filters = [];
        if (backgroundEffectBlur > 0) filters.push(`blur(${backgroundEffectBlur}px)`);
        if (backgroundEffectBrightness !== 1) filters.push(`brightness(${backgroundEffectBrightness})`);
        if (backgroundEffectContrast !== 1) filters.push(`contrast(${backgroundEffectContrast})`);
        if (backgroundEffectSaturation !== 1) filters.push(`saturate(${backgroundEffectSaturation})`);
        if (filters.length > 0) ctx.filter = filters.join(' ');

        let mediaNaturalWidth = 0;
        let mediaNaturalHeight = 0;

        if (backgroundType === 'image' && bgMedia instanceof HTMLImageElement && bgMedia.complete) {
          mediaNaturalWidth = bgMedia.naturalWidth;
          mediaNaturalHeight = bgMedia.naturalHeight;
        } else if (backgroundType === 'video' && bgMedia instanceof HTMLVideoElement && bgMedia.readyState >= 2 /*HAVE_CURRENT_DATA*/) {
          mediaNaturalWidth = bgMedia.videoWidth;
          mediaNaturalHeight = bgMedia.videoHeight;
        }

        if (mediaNaturalWidth > 0 && mediaNaturalHeight > 0) {
           const { drawWidth, drawHeight, offsetX, offsetY } = getContainSize(canvas.width, canvas.height, mediaNaturalWidth, mediaNaturalHeight);
           ctx.drawImage(bgMedia, offsetX, offsetY, drawWidth, drawHeight);
        }
        ctx.restore();
      }
    }

    // Apply VFX (Corner Glow)
    if (activeVfx === 'cornerGlow') {
      ctx.save();
      const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(canvas.width, canvas.height) * 0.6);
      glowGradient.addColorStop(0, 'rgba(255, 255, 220, 0.3)');
      glowGradient.addColorStop(1, 'rgba(255, 255, 220, 0)');
      ctx.fillStyle = glowGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }

    // Apply Vignette
    if (backgroundEffectVignette > 0) {
      ctx.save();
      const vignetteGradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, canvas.width * 0.2, canvas.width / 2, canvas.height / 2, canvas.width * 0.7);
      vignetteGradient.addColorStop(0, 'rgba(0,0,0,0)');
      vignetteGradient.addColorStop(1, `rgba(0,0,0,${backgroundEffectVignette})`);
      ctx.fillStyle = vignetteGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }

    // Apply Noise
    if (backgroundEffectNoise > 0 && noiseCanvasRef.current) {
      ctx.save();
      ctx.globalAlpha = backgroundEffectNoise;
      const pattern = ctx.createPattern(noiseCanvasRef.current, 'repeat');
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.restore();
    }

    // Draw Overlay Group (Browser bar + Media)
    ctx.save();
    ctx.globalAlpha = opacity;
    if (blurIntensity > 0) {
      ctx.filter = `blur(${blurIntensity}px)`;
    }

    ctx.save();
    const groupCenterX = canvas.width / 2 + overlayPosition.x;
    const groupCenterY = canvas.height / 2 + overlayPosition.y;

    ctx.translate(groupCenterX, groupCenterY);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.scale(scale, scale);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);


    // Draw Browser Bar if active
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

    // Draw Overlay Media
    const ovMedia = document.getElementById('overlay-media-export') as HTMLImageElement | HTMLVideoElement;
    if (ovMedia) {
        let naturalWidth = 0;
        let naturalHeight = 0;
        if (overlayType === 'image' && ovMedia instanceof HTMLImageElement && ovMedia.complete) {
            naturalWidth = ovMedia.naturalWidth;
            naturalHeight = ovMedia.naturalHeight;
        } else if (overlayType === 'video' && ovMedia instanceof HTMLVideoElement && ovMedia.readyState >=2 /*HAVE_CURRENT_DATA*/) {
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
            const offsetYForMedia = overlayContentY + (overlayContentHeight - drawHeight) / 2;

            if (drawWidth > 0 && drawHeight > 0) {
                 ctx.drawImage(ovMedia, offsetX, offsetYForMedia, drawWidth, drawHeight);
            }
        }
    }

    ctx.restore(); // Restore from group transform
    ctx.restore(); // Restore from opacity/blur

    if (roundedCorners) {
      ctx.restore(); // Restore from rounded corners clip
    }
  }, [
      backgroundMode, solidBackgroundColor, backgroundUrl, backgroundType,
      backgroundEffectBlur, backgroundEffectBrightness, backgroundEffectContrast, backgroundEffectSaturation,
      backgroundEffectVignette, backgroundEffectNoise, activeVfx,
      overlayType,
 opacity, scale, rotation, blurIntensity,
 overlayPosition, // Keep overlayPosition as it affects translate
      roundedCorners, browserBar, browserUrlText,
      getCurrentBrowserBarHeight, noiseCanvasRef
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
    let exportWidth = 1280;
    let exportHeight = 720;

    if ((backgroundMode === 'default' || backgroundMode === 'custom') && backgroundUrl) {
        const bgMedia = document.getElementById('background-media-export') as HTMLImageElement | HTMLVideoElement;
        if (!bgMedia) {
            setIsExporting(false);
            toast({ title: "Export Error", description: "Background media element not found.", variant: "destructive" });
            return;
        }
        try {
            await new Promise<void>((resolve, reject) => {
              if (backgroundType === 'image' && bgMedia instanceof HTMLImageElement) {
                if (bgMedia.complete && bgMedia.naturalWidth > 0) resolve();
                else {
                    bgMedia.onload = () => { if (bgMedia.naturalWidth > 0) resolve(); else reject(new Error("Background image loaded but has no dimensions.")); };
                    bgMedia.onerror = () => reject(new Error("Error loading background image for export."));
                }
              } else if (backgroundType === 'video' && bgMedia instanceof HTMLVideoElement) {
                if (bgMedia.readyState >= 2 && bgMedia.videoWidth > 0) resolve();
                else {
                    bgMedia.onloadeddata = () => { if (bgMedia.videoWidth > 0) resolve(); else reject(new Error("Background video loaded but has no dimensions.")); };
                    bgMedia.onerror = () => reject(new Error("Error loading background video for export."));
                }
              } else { // Should not happen if backgroundUrl is set for these modes
                resolve(); // Or reject appropriately
              }
            });
        } catch(err: any) {
            setIsExporting(false);
            toast({ title: "Media Load Error", description: err.message, variant: "destructive" });
            return;
        }


        exportWidth = bgMedia instanceof HTMLVideoElement ? (bgMedia.videoWidth || 1280) : ((bgMedia as HTMLImageElement).naturalWidth || 1280);
        exportHeight = bgMedia instanceof HTMLVideoElement ? (bgMedia.videoHeight || 720) : ((bgMedia as HTMLImageElement).naturalHeight || 720);
    } else if (overlayUrl) { // Fallback to overlay dimensions if no background
        const ovMedia = document.getElementById('overlay-media-export') as HTMLImageElement | HTMLVideoElement;
         if (ovMedia) {
            try {
                await new Promise<void>((resolve, reject) => {
                    if (overlayType === 'image' && ovMedia instanceof HTMLImageElement) {
                        if (ovMedia.complete && ovMedia.naturalWidth > 0) resolve();
                        else {
                            ovMedia.onload = () => { if (ovMedia.naturalWidth > 0) resolve(); else reject(new Error("Overlay image loaded but has no dimensions.")); };
                            ovMedia.onerror = () => reject(new Error("Error loading overlay image for export."));
                        }
                    } else if (overlayType === 'video' && ovMedia instanceof HTMLVideoElement) {
                        if (ovMedia.readyState >= 2 && ovMedia.videoWidth > 0) resolve();
                        else {
                            ovMedia.onloadeddata = () => { if (ovMedia.videoWidth > 0) resolve(); else reject(new Error("Overlay video loaded but has no dimensions."));};
                            ovMedia.onerror = () => reject(new Error("Error loading overlay video for export."));
                        }
                    } else { resolve(); }
                });
            } catch(err: any) {
                setIsExporting(false);
                toast({ title: "Overlay Media Load Error", description: err.message, variant: "destructive" });
                return;
            }


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
    backgroundMode, backgroundUrl, backgroundType, solidBackgroundColor, overlayUrl, overlayType,
    drawFrameOnCanvas, toast,
  ]);

  const waitForVideoEvent = (video: HTMLVideoElement, eventName: string) => {
    return new Promise<void>((resolve, reject) => {
      const onEvent = () => {
        video.removeEventListener(eventName, onEvent);
        video.removeEventListener('error', onError);
        resolve();
      };
      const onError = (e: Event) => {
        video.removeEventListener(eventName, onEvent);
        video.removeEventListener('error', onError);
        const error = video.error;
        let message = `Video emitted an error: ${e.type}.`;
        if (error) {
          message += ` Code: ${error.code}, Message: ${error.message}`;
        } else {
            const target = e.target as HTMLVideoElement;
            if(target && target.error) {
                 message += ` Code: ${target.error.code}, Message: ${target.error.message}`;
            } else {
                 message += ` Playback was likely interrupted or the source is invalid.`;
            }
        }
        reject(new Error(message));
      };
      video.addEventListener(eventName, onEvent);
      video.addEventListener('error', onError);
    });
  };


  const handleExportVideo = useCallback(async () => {
    if (!((backgroundMode === 'default' || backgroundMode === 'custom') && backgroundType === 'video' && backgroundUrl)) {
      toast({ title: "Export Not Available", description: "Video export currently requires a video background.", variant: "default" });
      return;
    }
    setIsExporting(true);

    // Ensure the hidden media elements are in the DOM
    // They are rendered via <HiddenMediaForExport /> but might not be ready immediately

    const bgVideo = document.getElementById('background-media-export') as HTMLVideoElement;
    const ovMediaElement = document.getElementById('overlay-media-export') as HTMLVideoElement | HTMLImageElement | null;

    let recorder: MediaRecorder | null = null;
    let bgVideoEndedListener: (() => void) | null = null;
    let duration = 0;
    let audioContext: AudioContext | null = null;

    const cleanup = () => {
      if (bgVideoEndedListener && bgVideo) {
        bgVideo.removeEventListener('ended', bgVideoEndedListener);
        bgVideoEndedListener = null;
      }
      if (bgVideo) bgVideo.pause();

      const ovElementForPause = document.getElementById('overlay-media-export');
      if (ovElementForPause && ovElementForPause instanceof HTMLVideoElement) {
        ovElementForPause.pause();
      }
      if (audioContext) {
        audioContext.close()
          .catch(e => console.error("Error closing AudioContext:", e));
        audioContext = null;
      }

      if (recorder && recorder.state === "recording") {
        recorder.stop(); // This should trigger onstop
      }
      // If recorder exists but isn't recording, or doesn't exist, it won't call onstop
      // so we need to ensure isExporting is false and animationFrameId is cleared.
      if(!recorder || recorder.state !== "recording") {
          setIsExporting(false);
          if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
            animationFrameIdRef.current = undefined;
          }
      }
    };


    try {
        if (!bgVideo) {
            throw new Error("Background video element not found.");
        }

      // Wait for background video to load metadata and be ready
        await waitForVideoEvent(bgVideo, 'loadeddata');
        if (!(bgVideo.videoWidth > 0 && bgVideo.videoHeight > 0)) {
            throw new Error("Background video metadata loaded but has no valid dimensions.");
        }
        if (!isFinite(bgVideo.duration) || bgVideo.duration <= 0) {
            toast({ title: "Export Warning", description: `Background video duration is invalid or not finite (${bgVideo.duration}). Export cannot proceed.`, variant: "destructive" });
            cleanup();
            return;
        }
        duration = bgVideo.duration;
      console.log(`Background video duration: ${duration} seconds`);


        const exportWidth = bgVideo.videoWidth;
        const exportHeight = bgVideo.videoHeight;

        const canvas = document.createElement('canvas');
        canvas.width = exportWidth;
        canvas.height = exportHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error("Could not get canvas context.");
        }

        // Setup audio stream
        let audioStream: MediaStream | undefined;
        try {
          audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const destination = audioContext.createMediaStreamDestination();

          const bgSource = audioContext.createMediaElementSource(bgVideo);
          bgSource.connect(destination);

          if (ovMediaElement && ovMediaElement instanceof HTMLVideoElement && overlayType === 'video' && ovMediaElement.src) {
             try {
                const ovSource = audioContext.createMediaElementSource(ovMediaElement);
                ovSource.connect(destination);
             } catch (err: any) {
                console.warn(`Could not create audio source for overlay video: ${err.message}. Exporting without overlay audio.`);
             }
          }
           audioStream = destination.stream;
        } catch (err: any) {
           console.warn(`Could not set up audio context: ${err.message}. Exporting video without audio.`);
        }

        const videoStream = canvas.captureStream(30); // 30 FPS
        const stream = audioStream ? new MediaStream([...videoStream.getVideoTracks(), ...audioStream.getAudioTracks()]) : videoStream;
        recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        const chunks: Blob[] = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          // Final cleanup activities that should happen after recorder stops
          // cleanup() will handle setIsExporting(false) and animationFrameIdRef.current
          if (animationFrameIdRef.current) { // This check might be redundant if cleanup is always called
             cancelAnimationFrame(animationFrameIdRef.current);
             animationFrameIdRef.current = undefined;
          }
          setIsExporting(false); // Ensure this is always set

          if (chunks.length === 0) {
            toast({ title: "Export Error", description: "No video data was recorded. The file might be empty.", variant: "destructive" });
            return;
          }
          const blob = new Blob(chunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; // The blob URL
          a.download = 'glass-view_export.webm';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast({ title: "Export Successful", description: "Video downloaded." });
        };
        
        recorder.onerror = (event) => {
          console.error("MediaRecorder error:", event);
          let errorMessage = "Video recording failed.";
           if (event && typeof (event as any).error === 'object' && (event as any).error !== null) {
            const recError = (event as any).error;
            errorMessage += ` ${recError.name || 'Unknown error'}: ${recError.message || ''}`;
          }
          toast({ title: "Export Error", description: errorMessage, variant: "destructive" });
          cleanup(); // Call cleanup on recorder error
        };

        bgVideoEndedListener = () => {
            if (recorder && recorder.state === "recording") {
                recorder.stop(); // This will trigger onstop, which should call cleanup
            }
        };
        bgVideo.addEventListener('ended', bgVideoEndedListener);


        bgVideo.currentTime = 0;
      // Wait for overlay video to load metadata and be ready if it exists
        if (ovMediaElement && ovMediaElement instanceof HTMLVideoElement && overlayType === 'video' && ovMediaElement.src) {
          ovMediaElement.currentTime = 0;
          try {
            await waitForVideoEvent(ovMediaElement, 'loadeddata');
            if (!(ovMediaElement.videoWidth > 0 && ovMediaElement.videoHeight > 0)) {
               console.warn("Overlay video metadata loaded but has no valid dimensions. It might not render correctly.");
            }
          } catch (err: any) {
            console.warn(`Error loading overlay video metadata: ${err.message}. Proceeding without overlay video if it fails to play.`);
          }
        }

      // Attempt to play both videos simultaneously
        try {
            await bgVideo.play();
            await waitForVideoEvent(bgVideo, 'playing');
        } catch (err: any) {
            throw new Error(`Failed to start background video playback for export: ${err.message}`);
        }


            try {
                await ovMediaElement.play();
                await waitForVideoEvent(ovMediaElement, 'playing');
            } catch (err: any) {
                 console.warn(`Could not start overlay video playback, proceeding without it: ${err.message}`);
            }
        }

        // Check if background video actually started playing
        if (bgVideo.paused || bgVideo.seeking || bgVideo.ended) {
            throw new Error("Background video playback did not start or paused unexpectedly before recording could begin.");
        }

        recorder.start(); // Start recording

        const recordFrame = () => {
          // Primary exit: if animationFrameIdRef.current is undefined (set by cleanup)
          if (animationFrameIdRef.current === undefined) {
            return;
          }

          if (!bgVideo || !ctx || !recorder ) { // Should ideally not happen
            if (recorder && recorder.state === "recording") recorder.stop();
            else cleanup();
            return;
          }

          let shouldStopRecording = false;

          if (bgVideo.ended) {
            shouldStopRecording = true;
          } else if (isFinite(duration) && bgVideo.currentTime >= duration) {
            shouldStopRecording = true;
          } else if (bgVideo.paused && !bgVideo.ended) { // Unexpected pause
            toast({ title: "Export Warning", description: "Video playback paused unexpectedly during export. Export may be incomplete.", variant: "destructive" });
            shouldStopRecording = true;
          }

          if (shouldStopRecording) {
            if (recorder.state === "recording") {
              recorder.stop(); // Triggers onstop -> cleanup
            } else {
              cleanup(); // If recorder already stopped/error
            }
            return; // Stop requesting new frames
          }

          drawFrameOnCanvas(ctx, canvas);
          
          // Continue the loop only if animationFrameIdRef.current is still defined (i.e., cleanup hasn't run)
          if (animationFrameIdRef.current !== undefined) {
            animationFrameIdRef.current = requestAnimationFrame(recordFrame);
          }
        };
        animationFrameIdRef.current = requestAnimationFrame(recordFrame); // Initialize the loop


    } catch (err: any) {
        toast({ title: "Export Error", description: err.message || "An unknown error occurred during video export setup.", variant: "destructive" });
        cleanup(); // Ensure cleanup is called on setup error
    }

  }, [
    backgroundMode, backgroundUrl, backgroundType, overlayType, overlayUrl,
    drawFrameOnCanvas, toast, solidBackgroundColor, // Added solidBackgroundColor
    // Removed isExporting from here
  ]);


  const HiddenMediaForExport = () => (
    <div style={{ display: 'none' }}>
      {backgroundUrl && (backgroundMode === 'default' || backgroundMode === 'custom') && backgroundType === 'image' && <img id="background-media-export" src={backgroundUrl} alt="background export" crossOrigin="anonymous" />}
      {backgroundUrl && (backgroundMode === 'default' || backgroundMode === 'custom') && backgroundType === 'video' && <video id="background-media-export" src={backgroundUrl} muted playsInline crossOrigin="anonymous" />}
      {overlayUrl && overlayType === 'image' && <img id="overlay-media-export" src={overlayUrl} alt="overlay export" crossOrigin="anonymous" />}
      {overlayUrl && overlayType === 'video' && <video id="overlay-media-export" src={overlayUrl} muted playsInline crossOrigin="anonymous" />}
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
            backgroundEffectNoise={backgroundEffectNoise}
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
            backgroundEffectNoise={backgroundEffectNoise}
            onBackgroundEffectNoiseChange={setBackgroundEffectNoise}
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
            <Button
              onClick={handleExportVideo}
              variant="outline"
              className="w-full"
              disabled={isExporting || !((backgroundMode === 'default' || backgroundMode === 'custom') && backgroundType === 'video' && backgroundUrl)}
            >
              {isExporting && ((backgroundMode === 'default' || backgroundMode === 'custom') && backgroundType === 'video') ? 'Exporting Video...' : 'Export as Video'}
              <Video className="ml-2 h-4 w-4" />
            </Button>
             {!((backgroundMode === 'default' || backgroundMode === 'custom') && backgroundType === 'video' && backgroundUrl) && (
                <p className="text-xs text-muted-foreground text-center">Video export requires a video background.</p>
            )}
          </CardContent>
        </Card>
      </footer>
      <HiddenMediaForExport />
    </div>
  );
}