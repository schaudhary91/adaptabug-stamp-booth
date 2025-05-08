'use client';

import { useState, useRef, useEffect, type RefObject } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Camera, Video, VideoOff, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
}

export function CameraCapture({ isOpen, onClose, onCapture }: CameraCaptureProps) {
  const videoRef: RefObject<HTMLVideoElement> = useRef<HTMLVideoElement>(null);
  const canvasRef: RefObject<HTMLCanvasElement> = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const startCamera = async () => {
    setError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } else {
        setError('Camera access is not supported by your browser.');
        toast({ title: "Error", description: "Camera access not supported.", variant: "destructive" });
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError('Failed to access camera. Please check permissions.');
      toast({ title: "Camera Error", description: "Failed to access camera. Check permissions.", variant: "destructive" });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && stream) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        onCapture(dataUrl);
        onClose();
      }
    } else {
        toast({ title: "Capture Error", description: "Could not capture image.", variant: "destructive" });
    }
  };
  
  // Ensure stopCamera is called when component unmounts or dialog closes
  useEffect(() => {
    return () => {
      stopCamera();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Camera className="h-6 w-6 text-primary" /> Take a Picture
          </DialogTitle>
        </DialogHeader>
        <div className="p-6 pt-0">
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive text-destructive rounded-md flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}
          <div className="aspect-video bg-muted rounded-md overflow-hidden relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              aria-label="Camera feed"
            />
            {!stream && !error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                <VideoOff className="h-16 w-16 mb-2" />
                <p>Camera is off or loading...</p>
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" aria-hidden="true"></canvas>
        </div>
        <DialogFooter className="p-6 pt-0 flex flex-row justify-end gap-2">
           <DialogClose asChild>
            <Button variant="outline" onClick={stopCamera}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleCapture} disabled={!stream || !!error} aria-label="Capture photo">
            <Video className="mr-2 h-4 w-4" /> Capture
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
