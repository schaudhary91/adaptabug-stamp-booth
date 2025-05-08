'use client';

import type { CSSProperties } from 'react';
import { useState, useEffect, useRef }
from 'react';
import Image from 'next/image';
import { ResizableBox, type ResizableBoxProps } from 'react-resizable';
import 'react-resizable/css/styles.css'; // Required for ResizableBox styles
import { Button } from '@/components/ui/button';
import { RotateCcw, Trash2, Move, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PlacedStampData {
  id: string;
  stampId: string;
  imageUrl: string;
  alt: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // degrees
  zIndex: number;
}

interface PlacedStampProps {
  data: PlacedStampData;
  onUpdate: (id: string, updates: Partial<PlacedStampData>) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string | null) => void;
  isSelected: boolean;
  workspaceBounds: DOMRect | null;
  baseImageSize: { width: number; height: number } | null;
}

export function PlacedStamp({
  data,
  onUpdate,
  onDelete,
  onSelect,
  isSelected,
  workspaceBounds,
  baseImageSize,
}: PlacedStampProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: data.x, y: data.y });
  const [size, setSize] = useState({ width: data.width, height: data.height });
  const [rotation, setRotation] = useState(data.rotation);

  const stampRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPosition({ x: data.x, y: data.y });
    setSize({ width: data.width, height: data.height });
    setRotation(data.rotation);
  }, [data.x, data.y, data.width, data.height, data.rotation]);


  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSelected) {
      onSelect(data.id);
    }
    // Check if the click is on a control button, if so, don't start drag
    const target = e.target as HTMLElement;
    if (target.closest('[data-control-button="true"]')) {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    onSelect(data.id);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !workspaceBounds || !stampRef.current) return;
    e.preventDefault();
    e.stopPropagation();

    let newX = e.clientX - dragStart.x;
    let newY = e.clientY - dragStart.y;

    // Constrain within workspace (relative to workspaceBounds)
    const stampRect = stampRef.current.getBoundingClientRect();
    const parentRect = stampRef.current.parentElement?.getBoundingClientRect();

    if (parentRect) {
      newX = Math.max(0, Math.min(newX, parentRect.width - size.width));
      newY = Math.max(0, Math.min(newY, parentRect.height - size.height));
    }
    
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    onUpdate(data.id, { x: position.x, y: position.y });
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, dragStart, workspaceBounds]);

  const handleResize: ResizableBoxProps['onResizeStop'] = (_event, { size: newSize }) => {
    setSize(newSize);
    onUpdate(data.id, { width: newSize.width, height: newSize.height });
  };

  const handleRotate = (degrees: number) => {
    const newRotation = (rotation + degrees) % 360;
    setRotation(newRotation);
    onUpdate(data.id, { rotation: newRotation });
  };

  const handleScale = (factor: number) => {
    const newWidth = Math.max(20, size.width * factor); // Min width 20px
    const newHeight = Math.max(20, size.height * factor); // Min height 20px
    setSize({ width: newWidth, height: newHeight });
    onUpdate(data.id, { width: newWidth, height: newHeight });
  };
  
  const style: CSSProperties = {
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: `${size.width}px`,
    height: `${size.height}px`,
    transform: `rotate(${rotation}deg)`,
    zIndex: isSelected ? data.zIndex + 1000 : data.zIndex, // Bring selected to front
    position: 'absolute',
    cursor: isDragging ? 'grabbing' : 'grab',
    border: isSelected ? '2px dashed hsl(var(--primary))' : 'none',
    boxSizing: 'border-box',
    transition: isDragging ? 'none' : 'box-shadow 0.2s ease-in-out, border 0.2s ease-in-out',
    boxShadow: isSelected ? '0 0 10px hsla(var(--primary), 0.5)' : 'none',
  };
  
  const aspectRatio = data.width / data.height;

  return (
    <ResizableBox
      width={size.width}
      height={size.height}
      onResizeStop={handleResize}
      minConstraints={[30, 30 / aspectRatio]}
      maxConstraints={baseImageSize ? [baseImageSize.width, baseImageSize.height] : [800, 800 / aspectRatio]}
      lockAspectRatio={true}
      style={style}
      handle={(handleAxis) => (
        <div
          className={cn(
            `react-resizable-handle react-resizable-handle-${handleAxis}`,
            isSelected ? 'bg-primary opacity-100' : 'opacity-0 group-hover:opacity-50',
            'transition-opacity'
          )}
          style={{
            width: '10px', height: '10px', borderRadius: '50%',
            position: 'absolute',
            ...(handleAxis === 'se' && { bottom: '-5px', right: '-5px', cursor: 'nwse-resize' }),
            ...(handleAxis === 'sw' && { bottom: '-5px', left: '-5px', cursor: 'nesw-resize' }),
            ...(handleAxis === 'ne' && { top: '-5px', right: '-5px', cursor: 'nesw-resize' }),
            ...(handleAxis === 'nw' && { top: '-5px', left: '-5px', cursor: 'nwse-resize' }),
          }}
        />
      )}
      draggableOpts={{ enableUserSelectHack: false }}
      onMouseDownCapture={handleMouseDown} // Use capture phase for ResizableBox
      ref={stampRef}
      className="group"
    >
        <Image
          src={data.imageUrl}
          alt={data.alt}
          layout="fill"
          objectFit="contain"
          draggable={false}
          priority
        />
        {isSelected && (
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 flex gap-1 p-1 bg-card rounded-md shadow-lg border border-border" data-control-button="true">
            <Button variant="ghost" size="icon" onClick={() => handleRotate(-15)} title="Rotate Left" aria-label="Rotate stamp left">
              <RotateCcw className="h-4 w-4 transform scale-x-[-1]" />
            </Button>
             <Button variant="ghost" size="icon" onClick={() => handleRotate(15)} title="Rotate Right" aria-label="Rotate stamp right">
              <RotateCcw className="h-4 w-4" />
            </Button>
             <Button variant="ghost" size="icon" onClick={() => handleScale(1.1)} title="Zoom In" aria-label="Zoom in stamp">
              <ZoomIn className="h-4 w-4" />
            </Button>
             <Button variant="ghost" size="icon" onClick={() => handleScale(0.9)} title="Zoom Out" aria-label="Zoom out stamp">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(data.id)} title="Delete Stamp" className="text-destructive hover:text-destructive hover:bg-destructive/10" aria-label="Delete stamp">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
    </ResizableBox>
  );
}
