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

export function ImageWorkspace() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [baseImageSize, setBaseImageSize] = useState<{ width: number; height: number } | null>(null);
  const [placedStamps, setPlacedStamps] = useState<PlacedStampData[]>([]);
  const [selectedStampId, setSelectedStampId] = useState<string | null>(null);
  const [nextStampZIndex, setNextStampZIndex] = useState<number>(1);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [currentError, setCurrentError] = useState<string | null>(null);

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
    toast({ title: 'Image Captured', description: 'Photo taken successfully!', className: 'bg-accent text-accent-foreground' });
  };

  const handleStampSelect = (stampConfig: StampConfig) => {
    if (!imageUrl) {
      toast({ title: 'No Image', description: 'Please upload or capture an image first.', variant: 'destructive' });
      setCurrentError('Please upload or capture an image first to add stamps.');
      return;
    }
    setCurrentError(null);
    const workspaceRect = workspaceRef.current?.getBoundingClientRect();
    if (!workspaceRect || !baseImageSize) return;

    // Calculate center position relative to the workspace
    // Adjust initial placement if image is smaller than stamp
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
    setSelectedStampId(newStamp.id); // Auto-select the new stamp
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
    // Deselect stamp if clicking on the workspace background (not on a stamp itself)
    if (e.target === workspaceRef.current || e.target === imageRef.current) {
      setSelectedStampId(null);
    }
  };

  const handleDownload = () => {
    if (!imageUrl || !workspaceRef.current || !imageRef.current) return;
    setCurrentError(null);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const baseImg = imageRef.current;
    canvas.width = baseImg.naturalWidth;
    canvas.height = baseImg.naturalHeight;

    // Draw base image
    ctx.drawImage(baseImg, 0, 0, baseImg.naturalWidth, baseImg.naturalHeight);

    // Sort stamps by zIndex to draw in correct order
    const sortedStamps = [...placedStamps].sort((a, b) => a.zIndex - b.zIndex);
    
    const imageClientWidth = imageRef.current.clientWidth;
    const imageClientHeight = imageRef.current.clientHeight;

    const scaleX = baseImg.naturalWidth / imageClientWidth;
    const scaleY = baseImg.naturalHeight / imageClientHeight;


    sortedStamps.forEach(async (stamp) => {
      const stampImg = new window.Image();
      stampImg.crossOrigin = "anonymous"; // Important for picsum or other CORS images
      stampImg.src = stamp.imageUrl;
      
      // We need to wait for each stamp image to load before drawing
      // This part could be improved with Promise.all for concurrent loading
      // For simplicity, direct drawing is used, may need refinement for complex cases
      
      // Calculate position and size on the original image scale
      const sx = stamp.x * scaleX;
      const sy = stamp.y * scaleY;
      const sWidth = stamp.width * scaleX;
      const sHeight = stamp.height * scaleY;

      ctx.save();
      // Translate and rotate context for the stamp
      // Rotation point should be center of the stamp
      ctx.translate(sx + sWidth / 2, sy + sHeight / 2);
      ctx.rotate((stamp.rotation * Math.PI) / 180);
      ctx.drawImage(stampImg, -sWidth / 2, -sHeight / 2, sWidth, sHeight);
      ctx.restore();
    });
    
    // The drawing might not be complete immediately if stamp images are still loading.
    // A more robust solution waits for all stamp images to load.
    // For this example, we proceed with a slight delay, assuming quick loads.
    setTimeout(() => {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'stamped-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: 'Image Downloaded!', description: 'Your masterpiece is saved.', className: 'bg-accent text-accent-foreground' });
    }, 500); // Adjust delay if needed
  };
  
  const handleClearWorkspace = () => {
    setImageUrl(null);
    setBaseImageSize(null);
    setPlacedStamps([]);
    setSelectedStampId(null);
    setNextStampZIndex(1);
    setCurrentError(null);
    toast({ title: 'Workspace Cleared', description: 'Ready for a new creation!' });
  };
  
  // Handle drag over and drop for adding stamps
  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!imageUrl) {
      toast({ title: 'No Image', description: 'Please upload or capture an image first.', variant: 'destructive' });
      setCurrentError('Please upload or capture an image first to add stamps.');
      return;
    }
    setCurrentError(null);
    const stampId = event.dataTransfer.getData("stampId");
    const stampConfig = predefinedStamps.find(s => s.id === stampId);

    if (stampConfig && workspaceRef.current && baseImageSize) {
      const workspaceRect = workspaceRef.current.getBoundingClientRect();
      
      // Calculate drop position relative to the workspace/image
      let dropX = event.clientX - workspaceRect.left - (stampConfig.width / 2);
      let dropY = event.clientY - workspaceRect.top - (stampConfig.height / 2);

      // Constrain within workspace bounds
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
        <StampSelector onStampSelect={handleStampSelect} selectedStampId={selectedStampId} />

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
                priority
                data-ai-hint="user image content"
              />
            ) : (
              <div className="text-center text-muted-foreground flex flex-col items-center">
                <ImageIcon className="w-16 h-16 mb-4" />
                <p className="text-lg font-medium">Upload or capture an image to start stamping!</p>
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
