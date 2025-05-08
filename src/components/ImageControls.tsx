
'use client';

import type { ChangeEvent } from 'react';
import { Upload, Camera, Download, Trash2, Settings2, Loader2, CheckCircle, Edit3, CircleArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageControlsProps {
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onCapture: () => void;
  onDownload: () => void;
  onClear: () => void;
  isImageLoaded: boolean;
  hasStamps: boolean;
  isDownloading?: boolean;
  appStep: 'awaitingImage' | 'editingImage' | 'finalizingImage';
  onContinueToEditing?: () => void;
  onProceedToDownload?: () => void;
  onReturnToEditing?: () => void;
}

export function ImageControls({
  onUpload,
  onCapture,
  onDownload,
  onClear,
  isImageLoaded,
  hasStamps,
  isDownloading = false,
  appStep,
  onContinueToEditing,
  onProceedToDownload,
  onReturnToEditing,
}: ImageControlsProps) {
  return (
    <div className="p-4 bg-card border-b shadow-sm">
      <div className="container mx-auto flex flex-wrap items-center justify-center gap-2 md:gap-4">
        
        {/* Step 1: Awaiting Image */}
        {appStep === 'awaitingImage' && (
          <>
            <Button onClick={() => document.getElementById('fileInput')?.click()} aria-label="Upload image" disabled={isDownloading}>
              <Upload className="mr-2 h-4 w-4" /> Upload Image
            </Button>
            <input
              type="file"
              id="fileInput"
              accept="image/*"
              className="hidden"
              onChange={onUpload}
              disabled={isDownloading}
            />
            <Button onClick={onCapture} aria-label="Take picture" disabled={isDownloading}>
              <Camera className="mr-2 h-4 w-4" /> Take Picture
            </Button>
            {isImageLoaded && onContinueToEditing && (
              <Button 
                onClick={onContinueToEditing} 
                disabled={isDownloading || !isImageLoaded}
                variant="default" // Use theme's primary color
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <CheckCircle className="mr-2 h-4 w-4" /> Continue to Stamping
              </Button>
            )}
          </>
        )}

        {/* Step 2: Editing Image */}
        {appStep === 'editingImage' && (
          <>
            {/* Option to change image or take new photo */}
            <Button onClick={() => document.getElementById('fileInputEditing')?.click()} aria-label="Change image" disabled={isDownloading}>
              <Upload className="mr-2 h-4 w-4" /> Change Image
            </Button>
            <input
              type="file"
              id="fileInputEditing" 
              accept="image/*"
              className="hidden"
              onChange={onUpload} 
              disabled={isDownloading}
            />
            <Button onClick={onCapture} aria-label="Take new picture" disabled={isDownloading}>
              <Camera className="mr-2 h-4 w-4" /> New Photo
            </Button>

            {/* Proceed to Download button */}
            {onProceedToDownload && (
              <Button 
                onClick={onProceedToDownload} 
                disabled={!isImageLoaded || !hasStamps || isDownloading}
                variant="default" // Use theme's primary color
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Edit3 className="mr-2 h-4 w-4" /> Proceed to Download
              </Button>
            )}
            {/* Clear All button */}
             <Button variant="outline" onClick={onClear} disabled={!isImageLoaded || isDownloading} aria-label="Clear workspace and start over">
              <Trash2 className="mr-2 h-4 w-4" /> Clear All & Start Over
            </Button>
            
            {/* Removed onToggleProperties and showPropertiesToggle as they are not used */}
          </>
        )}

        {/* Step 3: Finalizing Image */}
        {appStep === 'finalizingImage' && (
          <>
            {onReturnToEditing && (
              <Button variant="outline" onClick={onReturnToEditing} disabled={isDownloading}>
                <CircleArrowLeft className="mr-2 h-4 w-4" /> Back to Editing
              </Button>
            )}
            <Button 
              onClick={onDownload} 
              disabled={!isImageLoaded || !hasStamps || isDownloading} 
              aria-label="Download image with stamps" 
              variant="default" // Use theme's primary color
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isDownloading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {isDownloading ? 'Downloading...' : 'Download Final Image'}
            </Button>
            <Button variant="destructive" onClick={onClear} disabled={isDownloading} aria-label="Start over">
              <Trash2 className="mr-2 h-4 w-4" /> Start Over
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

