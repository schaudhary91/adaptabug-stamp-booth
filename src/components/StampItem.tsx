import type { StampConfig } from '@/config/stamps';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StampItemProps {
  stamp: StampConfig;
  onSelect: (stamp: StampConfig) => void;
  isSelected?: boolean;
}

export function StampItem({ stamp, onSelect, isSelected }: StampItemProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer hover:shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105",
        isSelected ? "ring-2 ring-primary shadow-lg scale-105" : "hover:border-accent"
      )}
      onClick={() => onSelect(stamp)}
      data-ai-hint={`${stamp.name.toLowerCase().replace(' ', '_')} stamp`}
      aria-label={`Select ${stamp.name} stamp`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(stamp); }}
    >
      <CardContent className="p-2 flex flex-col items-center gap-2">
        <div className="w-16 h-16 relative flex items-center justify-center">
          <Image
            src={stamp.imageUrl}
            alt={stamp.alt}
            width={64}
            height={64}
            className="object-contain transition-transform duration-200 group-hover:scale-110"
          />
        </div>
        <p className="text-xs text-center text-muted-foreground truncate w-full">{stamp.name}</p>
      </CardContent>
    </Card>
  );
}
