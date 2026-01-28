'use client';

import { Position, HoleCards } from '@/lib/types';
import RangeMatrix from './RangeMatrix';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface RangeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  position: Position;
  selectedHand: HoleCards;
}

export default function RangeSheet({ isOpen, onClose, position, selectedHand }: RangeSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl px-2">
        <SheetHeader className="px-2">
          <SheetTitle>{position} Range</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto mt-2">
          <RangeMatrix position={position} selectedHand={selectedHand} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
