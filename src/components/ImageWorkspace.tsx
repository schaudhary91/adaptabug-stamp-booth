
'use client';

import { useState, useRef, useEffect, type DragEvent, type ChangeEvent, useCallback } from 'react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { predefinedStamps, type StampConfig } from '@/config/stamps';
import { PlacedStamp, type PlacedStampData } from './PlacedStamp';
import { CameraCapture } from './CameraCapture';
import { ImageControls } from './ImageControls';
import { StampSelector } from './StampSelector';
import { Card, CardContent } from '@/components/ui/card';
import { ImageIcon, CheckCircle, AlertTriangle } from 'lucide-react';


type AppStep = 'awaitingImage' | 'editingImage' | 'finalizingImage';

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

  const addDefaultStamp = useCallback((_loadedBaseImageSize: { width: number; height: number }) => {
    const defaultStampConfig = predefinedStamps.find(s => s.id === 'default-adsux-logo');
    if (!defaultStampConfig || !workspaceRef.current) return;

    const workspaceRect = workspaceRef.current.getBoundingClientRect();
    if (!workspaceRect) return;

    const stampWidth = defaultStampConfig.width;
    const stampHeight = defaultStampConfig.height;

    // Position top left, 20px from top and 20px from left
    const desiredInitialX = 20;
    const desiredInitialY = 20;
    
    // Ensure the stamp stays within bounds if workspace is too small
    // initialX will be 20, unless (workspace width - stamp width) is less than 20, then it will be that smaller value.
    // If (workspace width - stamp width) is negative (stamp wider than workspace), initialX will be 0.
    let initialX = Math.max(0, Math.min(desiredInitialX, workspaceRect.width - stampWidth));
    let initialY = Math.max(0, Math.min(desiredInitialY, workspaceRect.height - stampHeight));


    const newStamp: PlacedStampData = {
      id: `stamp-default-${Date.now()}`,
      stampId: defaultStampConfig.id,
      imageUrl: defaultStampConfig.imageUrl,
      alt: defaultStampConfig.alt,
      x: initialX,
      y: initialY,
      width: stampWidth,
      height: stampHeight,
      rotation: 0,
      zIndex: 1, // Default stamp is at zIndex 1
    };
    
    setPlacedStamps([newStamp]); // Start with only the default stamp
    setNextStampZIndex(2); // Subsequent user-added stamps start at zIndex 2
  }, [workspaceRef]);


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
        setBaseImageSize(null); // Reset to trigger onLoad and default stamp placement
        setPlacedStamps([]); 
        setSelectedStampId(null);
        setNextStampZIndex(1); // Reset, will be adjusted by addDefaultStamp
        toast({ title: 'Image Selected', description: 'Image is ready. Click "Continue to Stamping" to proceed.', className: 'bg-accent text-accent-foreground' });
      };
      reader.readAsDataURL(file);
    }
    event.target.value = ''; 
  };

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = event.currentTarget;
    const newBaseImageSize = { width: img.naturalWidth, height: img.naturalHeight };
    setBaseImageSize(newBaseImageSize);
    // Add default stamp when new image is loaded and its dimensions are known
    // This relies on placedStamps being empty for a new image, which handleImageUpload/Capture ensures.
    if (placedStamps.length === 0 && imageUrl) { // Ensure imageUrl is also present
      addDefaultStamp(newBaseImageSize);
    }
  };

  const handleCapture = (dataUrl: string) => {
    setCurrentError(null);
    setImageUrl(dataUrl);
    setBaseImageSize(null); // Reset to trigger onLoad and default stamp placement
    setPlacedStamps([]);
    setSelectedStampId(null);
    setNextStampZIndex(1); // Reset, will be adjusted by addDefaultStamp
    setIsCameraOpen(false);
    toast({ title: 'Image Captured', description: 'Photo taken successfully! Click "Continue to Stamping".', className: 'bg-accent text-accent-foreground' });
  };
  
  const handleContinueToEditing = () => {
    if (!imageUrl) {
      toast({ title: 'No Image', description: 'Please upload or capture an image first.', variant: 'destructive' });
      setCurrentError('Please upload or capture an image first.');
      return;
    }
    setCurrentError(null);
    setAppStep('editingImage');
    toast({ title: 'Starting Stamping!', description: 'Choose stamps and place them on your image.', className: 'bg-accent text-accent-foreground' });
  };

  const handleProceedToDownload = () => {
    // Default stamp counts as "hasStamps"
    if (placedStamps.length === 0) {
      toast({ title: 'No Stamps Added', description: 'Please add at least one stamp to your image before proceeding.', variant: 'destructive' });
      setCurrentError('Add at least one stamp to proceed to the download step.');
      return;
    }
    setCurrentError(null);
    setSelectedStampId(null); 
    setAppStep('finalizingImage');
    toast({ title: 'Ready to Finalize', description: 'Your image is ready for download or further actions.', className: 'bg-accent text-accent-foreground' });
  };
  
  const handleReturnToEditing = () => {
    setAppStep('editingImage');
    setCurrentError(null);
  };


  const handleStampSelect = (stampConfig: StampConfig) => {
    if (!imageUrl || appStep !== 'editingImage') { 
      toast({ title: 'Action Not Allowed', description: 'Cannot add stamps in the current step.', variant: 'destructive' });
      setCurrentError('Stamps can only be added during the "editing" phase.');
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
     if (!imageUrl || !workspaceRef.current || !imageRef.current || appStep !== 'finalizingImage') {
      toast({ title: 'Download Error', description: 'Cannot download. Image not ready or not in finalizing step.', variant: 'destructive' });
      setCurrentError('Image not ready or not in finalizing step.');
      return;
    }
    if (placedStamps.length === 0) {
       toast({ title: 'Download Error', description: 'Image must have at least one stamp (e.g., the default logo) to download.', variant: 'destructive' });
       setCurrentError('Image must have stamps to enable download.');
       return;
    }
    setCurrentError(null);
    setIsDownloading(true);
    setSelectedStampId(null); 
    
    // Ensure DOM updates (like removing selection outline) are processed before canvas operations
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
        img.onerror = (e) => {
          console.error(`Error loading stamp image: ${stamp.alt}`, e);
          const errorMsg = e instanceof Event ? 'Network or CORS error' : (e as ErrorEvent).message;
          reject(new Error(`Failed to load stamp image: ${stamp.alt}. Error: ${errorMsg}`));
        }
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
    if (!imageUrl || appStep !== 'editingImage') { 
      toast({ title: 'Action Not Allowed', description: 'Cannot drop stamps in the current step.', variant: 'destructive' });
      setCurrentError('Stamps can only be dropped during the "editing" phase.');
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
        onContinueToEditing={handleContinueToEditing}
        onProceedToDownload={handleProceedToDownload}
        onReturnToEditing={handleReturnToEditing}
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
          <StampSelector onStampSelect={handleStampSelect} selectedStampId={null} />
        )}
        
        {(appStep === 'editingImage' || appStep === 'finalizingImage') && imageUrl && (
            <div className="text-center mb-2">
                <p className="text-lg font-semibold text-primary">
                    {appStep === 'editingImage' ? 'Step 2: Add & Edit Stamps' : 'Step 3: Finalize & Download'}
                </p>
                <p className="text-sm text-muted-foreground">
                    {appStep === 'editingImage' ? 'Select stamps, drag, resize, and rotate them on your image. The ADS UX logo is added by default.' : 'Review your creation. Download it or go back to make more changes.'}
                </p>
            </div>
        )}


        <Card 
          className="flex-grow shadow-lg overflow-hidden"
          onClick={handleWorkspaceClick}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <CardContent ref={workspaceRef} className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] bg-muted/50 flex items-center justify-center p-2 md:p-4">
            {imageUrl ? (
              <Image
                ref={imageRef}
                src={imageUrl}
                alt="User uploaded or captured image"
                fill
                style={{ objectFit: 'contain' }}
                onLoad={handleImageLoad}
                priority={appStep !== 'awaitingImage'}
                data-ai-hint="user image content"
              />
            ) : (
              <div className="text-center text-muted-foreground flex flex-col items-center">
                <ImageIcon className="w-16 h-16 mb-4" />
                <p className="text-lg font-medium">Step 1: Upload or capture an image to start stamping!</p>
                <p className="text-sm">Your creative canvas awaits.</p>
              </div>
            )}
            {imageUrl && baseImageSize && placedStamps.map((stamp) => (
              <PlacedStamp
                key={stamp.id}
                data={stamp}
                onUpdate={handleUpdateStamp}
                onDelete={handleDeleteStamp}
                onSelect={setSelectedStampId}
                isSelected={selectedStampId === stamp.id}
                workspaceBounds={workspaceRef.current?.getBoundingClientRect() ?? null}
                baseImageSize={baseImageSize}
                isInteractive={appStep === 'editingImage'} 
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

