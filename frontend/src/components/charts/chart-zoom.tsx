'use client';

import * as React from 'react';
import { Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export interface ChartZoomState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

export function useChartZoom(initial = false): ChartZoomState {
  const [isOpen, setIsOpen] = React.useState(initial);
  return {
    isOpen,
    open: React.useCallback(() => setIsOpen(true), []),
    close: React.useCallback(() => setIsOpen(false), []),
    setOpen: setIsOpen,
    toggle: React.useCallback(() => setIsOpen((prev) => !prev), []),
  };
}

export type ChartZoomSize = 'md' | 'lg' | 'xl';

const ZOOM_HEIGHT: Record<ChartZoomSize, string> = {
  md: 'h-[420px]',
  lg: 'h-[480px]',
  xl: 'h-[560px]',
};

interface ChartZoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  size?: ChartZoomSize;
  className?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function ChartZoomDialog({
  open,
  onOpenChange,
  title,
  description,
  icon,
  size = 'lg',
  className,
  children,
  footer,
}: ChartZoomDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'sm:max-w-5xl bg-card border-border p-0 rounded-2xl overflow-hidden gap-0',
          className
        )}
      >
        <DialogHeader className="flex flex-row items-center justify-between gap-3 space-y-0 border-b border-border/60 py-3.5 px-5 bg-muted/10">
          <div className="flex items-center gap-3 min-w-0">
            {icon && (
              <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                {icon}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-sm font-semibold text-foreground">{title}</DialogTitle>
              {description && (
                <DialogDescription className="text-xs mt-0.5 line-clamp-2">
                  {description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>
        <div className={cn('w-full p-5', ZOOM_HEIGHT[size])}>{children}</div>
        {footer && <div className="border-t border-border/60 px-5 py-3 bg-muted/5">{footer}</div>}
      </DialogContent>
    </Dialog>
  );
}

interface ChartZoomButtonProps {
  onClick: () => void;
  className?: string;
}

export function ChartZoomButton({ onClick, className }: ChartZoomButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={cn('size-8 text-muted-foreground hover:text-foreground cursor-pointer', className)}
      aria-label="Phóng to biểu đồ"
    >
      <Maximize2 className="size-4" />
    </Button>
  );
}
