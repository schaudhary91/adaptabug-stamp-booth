import { predefinedStamps, type StampConfig } from '@/config/stamps';
import { StampItem } from './StampItem';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StampSelectorProps {
  onStampSelect: (stamp: StampConfig) => void;
  selectedStampId?: string | null;
}

export function StampSelector({ onStampSelect, selectedStampId }: StampSelectorProps) {
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-xl text-center md:text-left text-primary">Choose a Stamp</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <ScrollArea className="w-full whitespace-nowrap rounded-md">
          <div className="flex w-max space-x-4 pb-4">
            {predefinedStamps.map((stamp) => (
              <StampItem
                key={stamp.id}
                stamp={stamp}
                onSelect={onStampSelect}
                isSelected={selectedStampId === stamp.id}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
