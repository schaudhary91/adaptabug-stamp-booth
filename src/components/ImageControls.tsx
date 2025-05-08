'use client';

import type { ChangeEvent } from 'react';
import { Upload, Camera, Download, Trash2, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageControlsProps {
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onCapture: () => void;
  onDownload: () => void;
  onClear: () => void;
  onToggleProperties?: () => void;
  showPropertiesToggle?: boolean;
  isImageLoaded: boolean;
  hasStamps: boolean; // New prop
}

export function ImageControls({
  onUpload,
  onCapture,
  onDownload,
  onClear,
  onToggleProperties,
  showPropertiesToggle = false,
  isImageLoaded,
  hasStamps, // Destructure new prop
}: ImageControlsProps) {
  return (
    <div className="p-4 bg-card border-b shadow-sm">
      <div className="container mx-auto flex flex-wrap items-center justify-center gap-2 md:gap-4">
        <Button onClick={() => document.getElementById('fileInput')?.click()} aria-label="Upload image">
          <Upload className="mr-2 h-4 w-4" /> Upload Image
        </Button>
        <input
          type="file"
          id="fileInput"
          accept="image/*"
          className="hidden"
          onChange={onUpload}
        />
        <Button onClick={onCapture} aria-label="Take picture">
          <Camera className="mr-2 h-4 w-4" /> Take Picture
        </Button>
        <Button onClick={onDownload} disabled={!isImageLoaded || !hasStamps} aria-label="Download image">
          <Download className="mr-2 h-4 w-4" /> Download
        </Button>
        <Button variant="outline" onClick={onClear} disabled={!isImageLoaded} aria-label="Clear workspace">
          <Trash2 className="mr-2 h-4 w-4" /> Clear All
        </Button>
        {showPropertiesToggle && onToggleProperties && (
           <Button variant="ghost" size="icon" onClick={onToggleProperties} aria-label="Toggle properties panel">
            <Settings2 className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
