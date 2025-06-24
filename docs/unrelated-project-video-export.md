
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, Film, AlertTriangle, FileAudio } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import type { TranscriptLine, VideoTemplateValue, VideoResolution, VideoAspectRatio, BackgroundConfig, IconPosition, TranscriptStyleConfig } from '@/types';
import { videoTemplates, defaultTranscriptStyleConfig } from '@/types';

interface ExportSectionProps {
  audioFile: File | null;
  backgroundConfig: BackgroundConfig | null;
  transcriptLines: TranscriptLine[];
  selectedTemplate: VideoTemplateValue;
  resolution: VideoResolution;
  aspectRatio: VideoAspectRatio;
  customIconFile: File | null;
  useDefaultIcon: boolean;
  iconPosition: IconPosition;
  // Removed transcriptPosition and transcriptStyleConfig as they are not used for export text rendering
}

const getOutputDimensions = (resolution: VideoResolution, aspectRatio: VideoAspectRatio): { width: number; height: number } => {
  let targetHeight = 1080; 
  if (resolution === '720p') targetHeight = 720;
  else if (resolution === '480p') targetHeight = 480;

  const [arW, arH] = aspectRatio.split(':').map(Number);
  
  let width = Math.round(targetHeight * (arW / arH));
  let height = targetHeight;

  // Ensure dimensions are even for better codec compatibility
  width = width % 2 === 0 ? width : width + 1;
  height = height % 2 === 0 ? height : height + 1;
  
  return { width, height };
};

const getIconDrawPosition = (
  iconW: number,
  iconH: number,
  videoW: number,
  videoH: number,
  position: IconPosition,
): { x: number; y: number } => {
  const responsivePadding = Math.max(10, Math.round(videoH * 0.025)); 

  switch (position) {
    case 'top-left':      return { x: responsivePadding, y: responsivePadding };
    case 'top-center':    return { x: (videoW - iconW) / 2, y: responsivePadding };
    case 'top-right':     return { x: videoW - iconW - responsivePadding, y: responsivePadding };
    case 'middle-left':   return { x: responsivePadding, y: (videoH - iconH) / 2 };
    case 'center':        return { x: (videoW - iconW) / 2, y: (videoH - iconH) / 2 };
    case 'middle-right':  return { x: videoW - iconW - responsivePadding, y: (videoH - iconH) / 2 };
    case 'bottom-left':   return { x: responsivePadding, y: videoH - iconH - responsivePadding };
    case 'bottom-center': return { x: (videoW - iconW) / 2, y: videoH - iconH - responsivePadding };
    case 'bottom-right':  return { x: videoW - iconW - responsivePadding, y: videoH - iconH - responsivePadding };
    default:              return { x: responsivePadding, y: responsivePadding };
  }
};

// Simplified text drawing for export, as requested
const getSimplifiedTranscriptDrawCoordinates = (
  canvasWidth: number,
  canvasHeight: number,
  fontSize: number,
  textMetrics: TextMetrics
): { x: number; y: number; textAlign: CanvasTextAlign; textBaseline: CanvasTextBaseline } => {
  const verticalMargin = Math.round(canvasHeight * 0.04);
  const x = canvasWidth / 2;
  const y = canvasHeight - verticalMargin - (fontSize * 0.2); // Adjust for baseline
  return { x, y, textAlign: 'center', textBaseline: 'bottom' };
};


export default function ExportSection({
  audioFile,
  backgroundConfig,
  transcriptLines,
  selectedTemplate,
  resolution,
  aspectRatio,
  customIconFile,
  useDefaultIcon,
  iconPosition,
}: ExportSectionProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    return () => { // Cleanup audio context on unmount
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }
    };
  }, []);

  const getAudioDuration = async (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      // Use a local audio context for duration check only
      const localAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const reader = new FileReader();
      reader.onload = (e) => {
        if (!e.target?.result || !(e.target.result instanceof ArrayBuffer)) {
          localAudioContext.close();
          return reject(new Error("Failed to read audio file for duration check."));
        }
        localAudioContext.decodeAudioData(e.target.result as ArrayBuffer)
          .then(buffer => {
            localAudioContext.close();
            resolve(buffer.duration);
          })
          .catch(err => {
            localAudioContext.close();
            console.error("Error decoding audio data for duration:", err);
            reject(new Error("Could not determine audio duration. Ensure it's a valid audio file."));
          });
      };
      reader.onerror = (err) => {
        localAudioContext.close();
        console.error("FileReader error for duration check:", err);
        reject(new Error("Could not read audio file for duration check."));
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const loadImage = (src: string | File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous'; 
      img.onload = () => resolve(img);
      img.onerror = (err) => {
        console.error('Image load error:', err, src);
        reject(new Error(`Failed to load image from ${typeof src === 'string' ? src : src.name}`));
      };
      if (typeof src === 'string') {
        img.src = src;
      } else {
        const objectURL = URL.createObjectURL(src);
        img.src = objectURL;
        // Ensure revokeObjectURL is called in both onload and onerror for file inputs
        const originalOnLoad = img.onload;
        img.onload = (e) => {
          URL.revokeObjectURL(objectURL);
          if (originalOnLoad) (originalOnLoad as EventListener).call(img, e); // Call original after revoking
        };
        const originalOnError = img.onerror;
        img.onerror = (e) => {
          URL.revokeObjectURL(objectURL);
          if (originalOnError) (originalOnError as OnErrorEventHandler).call(img, e, '',0,0,null);
        };
      }
    });
  };
  
  const drawFrame = useCallback((
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
    currentBgImage: HTMLImageElement | null,
    currentIconImage: HTMLImageElement | null,
    currentTranscriptText: string, // Simplified: using this text directly
    currentIconPosition: IconPosition,
  ) => {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw Background
    if (currentBgImage) {
      const imgAspectRatio = currentBgImage.width / currentBgImage.height;
      const canvasAspectRatioValue = canvasWidth / canvasHeight;
      let drawWidth, drawHeight, offsetX, offsetY;

      if (imgAspectRatio > canvasAspectRatioValue) { 
        drawHeight = canvasHeight;
        drawWidth = drawHeight * imgAspectRatio;
        offsetX = (canvasWidth - drawWidth) / 2;
        offsetY = 0;
      } else { 
        drawWidth = canvasWidth;
        drawHeight = drawWidth / imgAspectRatio;
        offsetY = (canvasHeight - drawHeight) / 2;
        offsetX = 0;
      }
      ctx.drawImage(currentBgImage, offsetX, offsetY, drawWidth, drawHeight);
    } else {
      ctx.fillStyle = '#CCCCCC'; // Fallback background color
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    // Draw Icon
    if (currentIconImage) {
      const iconTargetHeight = Math.round(canvasHeight * 0.07); 
      const iconAspectRatio = currentIconImage.width / currentIconImage.height;
      const iconDrawHeight = iconTargetHeight;
      const iconDrawWidth = iconTargetHeight * iconAspectRatio;
      
      const { x, y } = getIconDrawPosition(iconDrawWidth, iconDrawHeight, canvasWidth, canvasHeight, currentIconPosition);
      
      const iconBgPadding = Math.max(5, Math.round(iconDrawHeight * 0.1)); 
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      const cornerRadius = Math.max(3, Math.round(iconDrawHeight * 0.05));
      ctx.beginPath();
      ctx.roundRect(x - iconBgPadding, y - iconBgPadding, iconDrawWidth + 2 * iconBgPadding, iconDrawHeight + 2 * iconBgPadding, cornerRadius);
      ctx.fill();

      ctx.drawImage(currentIconImage, x, y, iconDrawWidth, iconDrawHeight);
    }
    
    // Draw Simplified Transcript Text
    if (currentTranscriptText) {
      const fontSize = Math.max(16, Math.round(canvasHeight / 28)); 
      ctx.font = `bold ${fontSize}px Arial, sans-serif`; // Simplified font
      
      const textMetrics = ctx.measureText(currentTranscriptText || " "); // Ensure non-empty for measureText
      const { x: textX, y: textY, textAlign, textBaseline } = getSimplifiedTranscriptDrawCoordinates(
        canvasWidth, canvasHeight, fontSize, textMetrics
      );
      
      // Simple black stroke for visibility
      ctx.strokeStyle = 'black';
      ctx.lineWidth = Math.max(1, fontSize / 15); // Stroke width relative to font size
      ctx.lineJoin = 'round'; // Smoother stroke joins
      ctx.textAlign = textAlign;
      ctx.textBaseline = textBaseline;
      ctx.strokeText(currentTranscriptText, textX, textY);

      ctx.fillStyle = 'white'; // Simplified text color
      ctx.fillText(currentTranscriptText, textX, textY);
    }
  }, []);


  const handleExport = async () => {
    console.log("handleExport called");
    if (!audioFile) {
      toast({ variant: "destructive", title: "Audio Missing", description: "Please upload an audio file to enable export." });
      return;
    }
    if (isMounted && typeof MediaRecorder === 'undefined') {
      toast({ variant: "destructive", title: "Browser Not Supported", description: "MediaRecorder API is not available." });
      return;
    }
    if (isExporting) {
        console.warn("Export called but already exporting.");
        return;
    }
    
    let audioObjectUrl: string | null = null;
    let localAudioElement: HTMLAudioElement | null = null; // Renamed to avoid conflict with audioRef

    try {
      setIsExporting(true);
      setExportProgress(0);
      recordedChunksRef.current = [];
      console.log("Export process started with MediaRecorder.");
      
      const mimeTypes = [
          'video/webm; codecs=vp9,opus', 'video/webm; codecs=vp8,opus',
          'video/webm; codecs=vp9', 'video/webm; codecs=vp8', 'video/webm',
      ];
      const supportedMimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type));

      if (!supportedMimeType) {
        toast({variant: "destructive", title: "Format Support Error", description: "WEBM format not supported by your browser for recording."});
        console.error("No supported WEBM MIME type found for MediaRecorder.");
        setIsExporting(false);
        return;
      }
      console.log(`Using MIME type for MediaRecorder: ${supportedMimeType}`);

      const audioDuration = await getAudioDuration(audioFile);
      console.log(`Audio duration for recording: ${audioDuration}s`);
      const outputDims = getOutputDimensions(resolution, aspectRatio);
      console.log(`Output dimensions for recording: ${outputDims.width}x${outputDims.height}`);

      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = outputDims.width;
      offscreenCanvas.height = outputDims.height;
      const ctx = offscreenCanvas.getContext('2d', { alpha: false }); // Set alpha to false for potential perf gain
      if (!ctx) {
        throw new Error("Could not get 2D context from offscreen canvas for recording.");
      }
      canvasRef.current = offscreenCanvas; // Store offscreen canvas in ref

      let bgImage: HTMLImageElement | null = null;
      if (backgroundConfig) {
        try {
          if (backgroundConfig.type === 'file' && backgroundConfig.value.type.startsWith('image/')) {
            bgImage = await loadImage(backgroundConfig.value);
          } else if (backgroundConfig.type === 'url' && /\.(jpeg|jpg|png|gif|webp|avif)$/i.test(backgroundConfig.value)) {
            bgImage = await loadImage(backgroundConfig.value);
          } else if (backgroundConfig.type === 'url' && (/\.(mp4|webm|mov)$/i.test(backgroundConfig.value) || backgroundConfig.value.startsWith('data:video')) ){
             toast({variant: "default", title:"Background Info", description:"Video backgrounds are not used for this export method. Using fallback color."});
          } else if (backgroundConfig.type === 'file' && backgroundConfig.value.type.startsWith('video/')) {
             toast({variant: "default", title:"Background Info", description:"Video backgrounds are not used for this export method. Using fallback color."});
          }
          console.log("Background image loaded for recording (if applicable).");
        } catch (e: any) {
          console.error("Error loading background image for recording:", e.message);
          toast({ variant: "destructive", title: "Background Load Error", description: `Could not load background: ${e.message}. Using fallback color for export.` });
        }
      }
      
      let iconImage: HTMLImageElement | null = null;
      const templateData = videoTemplates.find(t => t.value === selectedTemplate);
      if (customIconFile) {
        try { iconImage = await loadImage(customIconFile); console.log("Custom icon loaded for recording."); } 
        catch (e: any) { console.error("Error loading custom icon for recording:", e.message); }
      } else if (useDefaultIcon && templateData?.iconUrl) {
        try { iconImage = await loadImage(templateData.iconUrl); console.log("Default icon loaded for recording."); } 
        catch (e: any) { console.error("Error loading default icon for recording:", e.message); }
      }

      const initialTextToDraw = transcriptLines[0]?.text || (transcriptLines.length > 0 && transcriptLines[0] ? transcriptLines[0].text : " ");
      drawFrame(ctx, outputDims.width, outputDims.height, bgImage, iconImage, initialTextToDraw, iconPosition);
      console.log("Initial frame drawn to offscreen canvas for recording.");

      localAudioElement = document.createElement('audio');
      audioObjectUrl = URL.createObjectURL(audioFile);
      localAudioElement.src = audioObjectUrl;
      localAudioElement.muted = false; // Ensure audio plays for stream capture
      
      await new Promise<void>((resolvePromise, rejectPromise) => { 
        if (!localAudioElement) {
          rejectPromise(new Error("Audio element for recording is null."));
          return;
        }
        localAudioElement.onloadedmetadata = () => { console.log("Audio metadata loaded for recording."); resolvePromise(); }; 
        localAudioElement.onerror = () => { 
            console.error("Failed to load audio metadata for recording."); 
            rejectPromise(new Error("Failed to load audio metadata for recording."));
        };
      });
      audioRef.current = localAudioElement; // Store the local audio element

      const videoStream = offscreenCanvas.captureStream(30); // Target 30 FPS
      console.log("Offscreen canvas stream captured for recording.");

      // Close existing audio context if any, then create a new one
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        await audioContextRef.current.close();
      }
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const sourceNode = audioContextRef.current.createMediaElementSource(localAudioElement);
      const destNode = audioContextRef.current.createMediaStreamDestination();
      sourceNode.connect(destNode);
      sourceNode.connect(audioContextRef.current.destination); // Play audio through speakers
      const audioStreamTracks = destNode.stream.getAudioTracks();

      if (!audioStreamTracks || audioStreamTracks.length === 0) {
        throw new Error("Could not capture audio stream from the audio element for recording.");
      }
      console.log("Audio stream captured for recording via AudioContext.");

      const combinedStream = new MediaStream([...videoStream.getVideoTracks(), ...audioStreamTracks]);
      mediaRecorderRef.current = new MediaRecorder(combinedStream, { mimeType: supportedMimeType });
      console.log("MediaRecorder initialized for recording.");

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log(`MediaRecorder data available: ${event.data.size} bytes`);
          recordedChunksRef.current.push(event.data);
        } else {
          console.log("MediaRecorder data available: 0 bytes (ignoring)");
        }
      };

      mediaRecorderRef.current.onstop = () => {
        console.log("MediaRecorder stopped.");
        if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
          animationFrameIdRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(e => console.error("Error closing audio context onstop:", e));
        }
        if (audioObjectUrl) {
            URL.revokeObjectURL(audioObjectUrl);
            audioObjectUrl = null;
        }
        if (recordedChunksRef.current.length === 0) {
          console.warn("No data recorded. Output file will be empty or invalid.");
          toast({ variant: "destructive", title: "Recording Error", description: "No video data was recorded. Please try again." });
        } else {
          const blob = new Blob(recordedChunksRef.current, { type: supportedMimeType });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `audioviz_export_${Date.now()}.webm`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          console.log("Video downloaded.");
          toast({ title: "Export Complete!", description: "Your video has been downloaded." });
        }
        setExportProgress(100);
        setIsExporting(false);
      };
      
      mediaRecorderRef.current.onerror = (event: any) => {
        console.error("MediaRecorder error:", event.error?.name || event.type || event);
        toast({variant: "destructive", title:"Recording Error", description: `An error occurred: ${event.error?.message || event.error?.name || 'Unknown recording error'}`});
        if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
        if (audioRef.current && !audioRef.current.paused) audioRef.current.pause();
        
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(e => console.error("Error closing audio context onerror:", e));
        }
        if (audioObjectUrl) {
            URL.revokeObjectURL(audioObjectUrl);
            audioObjectUrl = null;
        }
        setIsExporting(false);
      };

      let currentTranscriptAnimIndex = 0;
      let lastTranscriptUpdateTime = 0;
      const transcriptInterval = 3000; // ms
      let animationStartTime = 0;

      const renderLoop = (timestamp: number) => {
        try {
            if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== "recording" || !audioRef.current ) {
              if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current); // Stop loop if state changes
              return;
            }
             if (audioRef.current.ended && mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                console.log("Audio ended in renderLoop, stopping MediaRecorder.");
                mediaRecorderRef.current.stop();
                return; 
            }

            if (animationStartTime === 0) animationStartTime = timestamp;
            const elapsedTime = timestamp - animationStartTime;

            if (elapsedTime - lastTranscriptUpdateTime > transcriptInterval && transcriptLines.length > 1) {
                currentTranscriptAnimIndex = (currentTranscriptAnimIndex + 1);
                lastTranscriptUpdateTime = elapsedTime;
            }
            const textIndex = transcriptLines.length > 0 ? currentTranscriptAnimIndex % transcriptLines.length : 0;
            const currentTextToDraw = transcriptLines[textIndex]?.text || (transcriptLines.length > 0 && transcriptLines[textIndex] ? transcriptLines[textIndex].text : " ");
            
            const currentCtx = canvasRef.current?.getContext('2d');
            if (currentCtx) {
                drawFrame(currentCtx, outputDims.width, outputDims.height, bgImage, iconImage, currentTextToDraw, iconPosition);
            }
            
            if (audioRef.current && audioDuration > 0) {
                const progress = (audioRef.current.currentTime / audioDuration) * 100;
                setExportProgress(Math.min(100, progress));
            }
            animationFrameIdRef.current = requestAnimationFrame(renderLoop);
        } catch (renderError) {
            console.error("Error in renderLoop:", renderError);
            toast({variant: "destructive", title: "Render Loop Error", description: "An error occurred during video frame generation."});
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") mediaRecorderRef.current.stop();
            if (audioRef.current && !audioRef.current.paused) audioRef.current.pause();
            if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
            setIsExporting(false); // Ensure state is reset
        }
      };
      
      audioRef.current.onended = () => {
        console.log("Audio ended during recording (onended event).");
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop(); 
        }
      };
      
      mediaRecorderRef.current.onstart = () => {
        console.log("MediaRecorder started recording.");
      };

      // mediaRecorderRef.current.start(); // Changed: Start with timeslice for periodic data
      mediaRecorderRef.current.start(1000); // Collect data every 1000ms (1 second)
      
      audioRef.current.currentTime = 0; 
      try {
        await audioRef.current.play();
        console.log("Audio playback started for recording.");
      } catch (playError) {
        console.error("Error playing audio for recording:", playError);
        toast({ variant: "destructive", title: "Playback Error", description: "Could not start audio playback for recording." });
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
             audioContextRef.current.close().catch(e => console.error("Error closing audio context on playError:", e));
        }
        if (audioObjectUrl) URL.revokeObjectURL(audioObjectUrl);
        throw playError; 
      }
      
      animationFrameIdRef.current = requestAnimationFrame(renderLoop);
      toast({ title: "Recording Started...", description: "The export will take as long as the audio plays." });

    } catch (error: any) {
      console.error("Error during export setup or playback initiation:", error);
      toast({ variant: "destructive", title: "Export Failed", description: error.message || "An unexpected error occurred during video processing setup." });
      setExportProgress(0);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop(); 
      }
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close().catch(e => console.error("Error closing audio context in main catch:", e));
      }
      if (audioObjectUrl) {
          URL.revokeObjectURL(audioObjectUrl);
      }
      
      audioRef.current = null;
      // canvasRef.current = null; // Keep canvasRef as it might be needed by drawFrame
      mediaRecorderRef.current = null;

      setIsExporting(false); 
    }
  };

  // Diagnostic logs at render time for button state
  useEffect(() => {
    if (isMounted) { 
      const mediaRecorderSupported = typeof MediaRecorder !== 'undefined';
      const buttonDisabled = isExporting || !audioFile || !mediaRecorderSupported;
      console.log('ExportSection render status:', {
        isExporting,
        audioFilePresent: !!audioFile,
        mediaRecorderSupported,
        calculatedDisabled: buttonDisabled,
      });
    }
  }, [isMounted, isExporting, audioFile]);


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Film className="mr-2 h-6 w-6 text-primary" />
          Export Video
        </CardTitle>
        <CardDescription>
          Create your video. The process will take as long as your audio file plays.
          {isMounted && !audioFile && (
            <span className="block mt-1 text-sm text-muted-foreground">
              <FileAudio className="inline h-4 w-4 mr-1" />
              Please upload an audio file to enable export.
            </span>
          )}
          {isMounted && typeof MediaRecorder === 'undefined' && (
            <span className="block mt-1 text-sm text-destructive">
              <AlertTriangle className="inline h-4 w-4 mr-1" />
              Video recording API not supported by your browser. Export is disabled.
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleExport}
          disabled={isExporting || !audioFile || (isMounted && typeof MediaRecorder === 'undefined')}
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-6"
        >
          <Download className="mr-2 h-5 w-5" />
          {isExporting ? `Recording... ${exportProgress.toFixed(0)}%` : "Export Video"}
        </Button>
        {isExporting && (
          <Progress value={exportProgress} className="w-full h-3" />
        )}
      </CardContent>
    </Card>
  );
}