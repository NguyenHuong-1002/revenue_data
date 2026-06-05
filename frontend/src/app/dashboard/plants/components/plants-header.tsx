'use client';

import { DashboardHeader } from '@/components/dashboard-header';

interface PlantsHeaderProps {
  isAdmin: boolean;
  onAddClick: () => void;
}

export function PlantsHeader({ isAdmin, onAddClick }: PlantsHeaderProps) {
  return (
    <DashboardHeader
      title="Quản lý nhà kho"
      description="Quản lý thông tin nhà kho, xưởng sản xuất, địa chỉ và thông tin liên hệ của quản lý kho."
      buttonText="Thêm nhà kho"
      onButtonClick={onAddClick}
      isButtonDisabled={!isAdmin}
      buttonTooltip={!isAdmin ? 'Chỉ Quản trị viên mới có quyền thêm nhà kho' : undefined}
    />
  );
}
