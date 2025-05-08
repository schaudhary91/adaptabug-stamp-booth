'use client';

import { useState, useRef, useEffect, type DragEvent, type ChangeEvent } from 'react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { predefinedStamps, type StampConfig } from '@/config/stamps';
import { PlacedStamp, type PlacedStampData } from './PlacedStamp';
import { CameraCapture } from './CameraCapture';
import { ImageControls } from './ImageControls';
import { StampSelector } from './StampSelector';
import { Card, CardContent } from '@/components/ui/card';
import { ImageIcon, CheckCircle, AlertTriangle } from 'lucide-react';

type AppStep = 'awaitingImage' | 'editingImage';

export function ImageWorkspace() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [baseImageSize, setBaseImageSize] = useState<{ width: number; height: number } | null>(null);
  const [placedStamps, setPlacedStamps] = useState<PlacedStampData[]>([]);
  const [selectedStampId, setSelectedStampId] = useState<string | null>(null);
  const [nextStampZIndex, setNextStampZIndex] = useState<number>(1);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [appStep, setAppStep] = useState<AppStep>('awaitingImage');


  const workspaceRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null); // Ref for the base image
  const { toast } = useToast();

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    setCurrentError(null);
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setCurrentError('File is too large. Maximum size is 5MB.');
        toast({ title: 'Upload Error', description: 'File size exceeds 5MB limit.', variant: 'destructive' });
        return;
      }
      if (!file.type.startsWith('image/')) {
        setCurrentError('Invalid file type. Please upload an image.');
        toast({ title: 'Upload Error', description: 'Invalid file type. Please upload an image.', variant: 'destructive' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        setPlacedStamps([]); // Clear stamps on new image
        setSelectedStampId(null);
        setNextStampZIndex(1);
        setAppStep('editingImage');
        toast({ title: 'Image Uploaded', description: 'Your image is ready to be stamped!', className: 'bg-accent text-accent-foreground' });
      };
      reader.readAsDataURL(file);
    }
    event.target.value = ''; // Reset file input
  };

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = event.currentTarget;
    setBaseImageSize({ width: img.naturalWidth, height: img.naturalHeight });
  };

  const handleCapture = (dataUrl: string) => {
    setCurrentError(null);
    setImageUrl(dataUrl);
    setPlacedStamps([]);
    setSelectedStampId(null);
    setNextStampZIndex(1);
    setIsCameraOpen(false);
    setAppStep('editingImage');
    toast({ title: 'Image Captured', description: 'Photo taken successfully!', className: 'bg-accent text-accent-foreground' });
  };

  const handleStampSelect = (stampConfig: StampConfig) => {
    if (!imageUrl || appStep === 'awaitingImage') {
      toast({ title: 'No Image', description: 'Please upload or capture an image first.', variant: 'destructive' });
      setCurrentError('Please upload or capture an image first to add stamps.');
      return;
    }
    setCurrentError(null);
    const workspaceRect = workspaceRef.current?.getBoundingClientRect();
    if (!workspaceRect || !baseImageSize) return;

    const initialX = Math.max(0, (workspaceRect.width - stampConfig.width) / 2);
    const initialY = Math.max(0, (workspaceRect.height - stampConfig.height) / 2);

    const newStamp: PlacedStampData = {
      id: `stamp-${Date.now()}-${Math.random()}`,
      stampId: stampConfig.id,
      imageUrl: stampConfig.imageUrl,
      alt: stampConfig.alt,
      x: initialX,
      y: initialY,
      width: stampConfig.width,
      height: stampConfig.height,
      rotation: 0,
      zIndex: nextStampZIndex,
    };
    setPlacedStamps((prev) => [...prev, newStamp]);
    setNextStampZIndex((prev) => prev + 1);
    setSelectedStampId(newStamp.id); 
    toast({
      title: `${stampConfig.name} Added!`,
      description: 'Drag, resize, and rotate your new stamp.',
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    });
  };

  const handleUpdateStamp = (id: string, updates: Partial<PlacedStampData>) => {
    setPlacedStamps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const handleDeleteStamp = (id: string) => {
    setPlacedStamps((prev) => prev.filter((s) => s.id !== id));
    if (selectedStampId === id) {
      setSelectedStampId(null);
    }
    toast({ title: 'Stamp Removed', variant: 'default' });
  };

  const handleWorkspaceClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === workspaceRef.current || e.target === imageRef.current) {
      setSelectedStampId(null);
    }
  };

  const handleDownload = async () => {
     if (!imageUrl || !workspaceRef.current || !imageRef.current || appStep === 'awaitingImage') {
      toast({ title: 'Download Error', description: 'Cannot download. Please upload an image and add stamps.', variant: 'destructive' });
      setCurrentError('Image not ready or no stamps added for download.');
      return;
    }
    if (placedStamps.length === 0) {
       toast({ title: 'Download Error', description: 'Please add stamps to the image before downloading.', variant: 'destructive' });
       setCurrentError('Add stamps to the image to enable download.');
       return;
    }
    setCurrentError(null);
    setIsDownloading(true);

    // Deselect stamp before download to remove border/controls
    setSelectedStampId(null); 
    // Allow UI to update before starting canvas operations
    await new Promise(resolve => setTimeout(resolve, 50));


    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      toast({ title: 'Download Error', description: 'Could not create canvas for download.', variant: 'destructive' });
      setIsDownloading(false);
      return;
    }

    const baseImg = imageRef.current;
    canvas.width = baseImg.naturalWidth;
    canvas.height = baseImg.naturalHeight;

    ctx.drawImage(baseImg, 0, 0, baseImg.naturalWidth, baseImg.naturalHeight);

    const sortedStamps = [...placedStamps].sort((a, b) => a.zIndex - b.zIndex);
    
    const imageClientWidth = imageRef.current.clientWidth;
    const imageClientHeight = imageRef.current.clientHeight;

    const scaleX = baseImg.naturalWidth / imageClientWidth;
    const scaleY = baseImg.naturalHeight / imageClientHeight;

    const loadImagePromises = sortedStamps.map(stamp => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new window.Image();
        img.crossOrigin = "anonymous"; 
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(new Error(`Failed to load stamp image: ${stamp.alt}. Error: ${err}`));
        img.src = stamp.imageUrl;
      });
    });

    try {
      const loadedStampImages = await Promise.all(loadImagePromises);

      loadedStampImages.forEach((stampImg, index) => {
        const stamp = sortedStamps[index];
        const sx = stamp.x * scaleX;
        const sy = stamp.y * scaleY;
        const sWidth = stamp.width * scaleX;
        const sHeight = stamp.height * scaleY;

        ctx.save();
        ctx.translate(sx + sWidth / 2, sy + sHeight / 2);
        ctx.rotate((stamp.rotation * Math.PI) / 180);
        ctx.drawImage(stampImg, -sWidth / 2, -sHeight / 2, sWidth, sHeight);
        ctx.restore();
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'stamped-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: 'Image Downloaded!', description: 'Your masterpiece is saved.', className: 'bg-accent text-accent-foreground' });

    } catch (error) {
      console.error("Error loading stamp images for download:", error);
      toast({ title: 'Download Error', description: `Failed to load some stamp images. Please try again. ${error instanceof Error ? error.message : ''}`, variant: 'destructive' });
      setCurrentError('Could not load all stamp images for download.');
    } finally {
      setIsDownloading(false);
    }
  };
  
  const handleClearWorkspace = () => {
    setImageUrl(null);
    setBaseImageSize(null);
    setPlacedStamps([]);
    setSelectedStampId(null);
    setNextStampZIndex(1);
    setCurrentError(null);
    setAppStep('awaitingImage');
    toast({ title: 'Workspace Cleared', description: 'Ready for a new creation!' });
  };
  
  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault(); 
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!imageUrl || appStep === 'awaitingImage') {
      toast({ title: 'No Image', description: 'Please upload or capture an image first.', variant: 'destructive' });
      setCurrentError('Please upload or capture an image first to add stamps.');
      return;
    }
    setCurrentError(null);
    const stampId = event.dataTransfer.getData("stampId");
    const stampConfig = predefinedStamps.find(s => s.id === stampId);

    if (stampConfig && workspaceRef.current && baseImageSize) {
      const workspaceRect = workspaceRef.current.getBoundingClientRect();
      
      let dropX = event.clientX - workspaceRect.left - (stampConfig.width / 2);
      let dropY = event.clientY - workspaceRect.top - (stampConfig.height / 2);

      dropX = Math.max(0, Math.min(dropX, workspaceRect.width - stampConfig.width));
      dropY = Math.max(0, Math.min(dropY, workspaceRect.height - stampConfig.height));
      
      const newStamp: PlacedStampData = {
        id: `stamp-${Date.now()}-${Math.random()}`,
        stampId: stampConfig.id,
        imageUrl: stampConfig.imageUrl,
        alt: stampConfig.alt,
        x: dropX,
        y: dropY,
        width: stampConfig.width,
        height: stampConfig.height,
        rotation: 0,
        zIndex: nextStampZIndex,
      };
      setPlacedStamps((prev) => [...prev, newStamp]);
      setNextStampZIndex((prev) => prev + 1);
      setSelectedStampId(newStamp.id);
      toast({
        title: `${stampConfig.name} Added!`,
        description: 'Stamp dropped onto the image.',
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      });
    }
  };


  return (
    <div className="flex flex-col h-full">
      <ImageControls
        onUpload={handleImageUpload}
        onCapture={() => setIsCameraOpen(true)}
        onDownload={handleDownload}
        onClear={handleClearWorkspace}
        isImageLoaded={!!imageUrl}
        hasStamps={placedStamps.length > 0}
        isDownloading={isDownloading}
        appStep={appStep}
      />
      
      {currentError && (
        <div className="container mx-auto mt-4">
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="p-4 flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <p className="font-medium">{currentError}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="container mx-auto py-4 md:py-8 flex-grow flex flex-col gap-4 md:gap-8">
        {appStep === 'editingImage' && imageUrl && (
          <StampSelector onStampSelect={handleStampSelect} selectedStampId={selectedStampId} />
        )}

        <Card 
          className="flex-grow shadow-lg overflow-hidden"
          onClick={handleWorkspaceClick}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <CardContent ref={workspaceRef} className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] bg-muted/50 flex items-center justify-center p-2 md:p-4">
            {appStep === 'editingImage' && imageUrl ? (
              <Image
                ref={imageRef}
                src={imageUrl}
                alt="User uploaded or captured image"
                fill
                style={{ objectFit: 'contain' }}
                onLoad={handleImageLoad}
                priority
                data-ai-hint="user image content"
              />
            ) : (
              <div className="text-center text-muted-foreground flex flex-col items-center">
                <ImageIcon className="w-16 h-16 mb-4" />
                <p className="text-lg font-medium">Step 1: Upload or capture an image to start stamping!</p>
                <p className="text-sm">Your creative canvas awaits.</p>
              </div>
            )}
            {appStep === 'editingImage' && imageUrl && baseImageSize && placedStamps.map((stamp) => (
              <PlacedStamp
                key={stamp.id}
                data={stamp}
                onUpdate={handleUpdateStamp}
                onDelete={handleDeleteStamp}
                onSelect={setSelectedStampId}
                isSelected={selectedStampId === stamp.id}
                workspaceBounds={workspaceRef.current?.getBoundingClientRect() ?? null}
                baseImageSize={baseImageSize}
              />
            ))}
          </CardContent>
        </Card>
      </div>

      <CameraCapture
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCapture}
      />
    </div>
  );
}
