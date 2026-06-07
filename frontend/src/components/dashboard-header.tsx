'use client';

import { Plus, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';

interface DashboardHeaderProps {
  title: string | React.ReactNode;
  description?: string;
  buttonText?: string;
  buttonIcon?: LucideIcon;
  onButtonClick?: () => void;
  isButtonDisabled?: boolean;
  buttonTooltip?: string;
  children?: React.ReactNode;
  dialogContent?: React.ReactNode;
  isDialogOpen?: boolean;
  onDialogOpenChange?: (open: boolean) => void;
  icon?: LucideIcon;
  iconClassName?: string;
}

export function DashboardHeader({
  title,
  description,
  buttonText,
  buttonIcon: ButtonIcon = Plus,
  onButtonClick,
  isButtonDisabled = false,
  buttonTooltip,
  children,
  dialogContent,
  isDialogOpen,
  onDialogOpenChange,
  icon: Icon,
  iconClassName = 'text-blue-500',
}: DashboardHeaderProps) {
  const renderButton = () => {
    if (!buttonText) return null;

    return (
      <Button
        disabled={isButtonDisabled}
        onClick={dialogContent ? undefined : onButtonClick}
        className="bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg hover:shadow-blue-500/10 shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        title={buttonTooltip}
      >
        <ButtonIcon className="size-4 mr-2" />
        {buttonText}
      </Button>
    );
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          {Icon && <Icon className={`size-8 ${iconClassName} shrink-0`} />}
          {title}
        </h1>
        {description && <p className="text-muted-foreground text-sm mt-1">{description}</p>}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {children}
        {buttonText &&
          (dialogContent ? (
            <Dialog open={isDialogOpen} onOpenChange={onDialogOpenChange}>
              <DialogTrigger asChild>{renderButton()}</DialogTrigger>
              <DialogContent className="sm:max-w-125">{dialogContent}</DialogContent>
            </Dialog>
          ) : (
            renderButton()
          ))}
      </div>
    </div>
  );
}
