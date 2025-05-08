'use client';

import type { ChangeEvent } from 'react';
import { Upload, Camera, Download, Trash2, Settings2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageControlsProps {
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onCapture: () => void;
  onDownload: () => void;
  onClear: () => void;
  onToggleProperties?: () => void;
  showPropertiesToggle?: boolean;
  isImageLoaded: boolean;
  hasStamps: boolean;
  isDownloading?: boolean; // New prop for download state
}

export function ImageControls({
  onUpload,
  onCapture,
  onDownload,
  onClear,
  onToggleProperties,
  showPropertiesToggle = false,
  isImageLoaded,
  hasStamps,
  isDownloading = false, // Default to false
}: ImageControlsProps) {
  return (
    <div className="p-4 bg-card border-b shadow-sm">
      <div className="container mx-auto flex flex-wrap items-center justify-center gap-2 md:gap-4">
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
        <Button onClick={onDownload} disabled={!isImageLoaded || !hasStamps || isDownloading} aria-label="Download image">
          {isDownloading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {isDownloading ? 'Downloading...' : 'Download'}
        </Button>
        <Button variant="outline" onClick={onClear} disabled={!isImageLoaded || isDownloading} aria-label="Clear workspace">
          <Trash2 className="mr-2 h-4 w-4" /> Clear All
        </Button>
        {showPropertiesToggle && onToggleProperties && (
           <Button variant="ghost" size="icon" onClick={onToggleProperties} aria-label="Toggle properties panel" disabled={isDownloading}>
            <Settings2 className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
