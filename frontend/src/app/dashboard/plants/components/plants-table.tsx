'use client';

import { MapPin, User, Phone, Calendar, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { IPlant } from '@/lib/types/plant';

interface PlantsTableProps {
  plants: IPlant[];
  isAdmin: boolean;
  onEdit: (plant: IPlant) => void;
  onDelete: (plantId: string) => void;
}

export function PlantsTable({ plants, isAdmin, onEdit, onDelete }: PlantsTableProps) {
  return (
    <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card shadow-md">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/20 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            <th className="px-6 py-4">Mã nhà kho</th>
            <th className="px-6 py-4">Tên nhà kho</th>
            <th className="px-6 py-4">Địa chỉ</th>
            <th className="px-6 py-4">Người quản lý</th>
            <th className="px-6 py-4">Số điện thoại</th>
            <th className="px-6 py-4">Ngày tạo</th>
            <th className="px-6 py-4 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-sm text-foreground">
          {plants.map((plant) => (
            <tr key={plant.plant_id} className="hover:bg-muted/10 transition-colors">
              <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                {plant.plant_id}
              </td>
              <td className="px-6 py-4 font-semibold text-foreground">
                {plant.name_plant}
              </td>
              <td className="px-6 py-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5 inline text-blue-500" />
                  {plant.address}
                </span>
              </td>
              <td className="px-6 py-4 font-medium text-foreground">
                <span className="flex items-center gap-1">
                  <User className="size-3.5 inline text-purple-500" />
                  {plant.manager_name}
                </span>
              </td>
              <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Phone className="size-3.5 inline text-emerald-500" />
                  {plant.phone}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                <span className="flex items-center gap-1.5 text-xs">
                  <Calendar className="size-3.5" />
                  {new Date(plant.created_at).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="flex justify-end items-center gap-2">
                  <Button
                    onClick={() => onEdit(plant)}
                    disabled={!isAdmin}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    title={
                      !isAdmin ? 'Bạn không có quyền sửa nhà kho này' : 'Sửa thông tin'
                    }
                  >
                    <Edit className="size-4" />
                  </Button>
                  <Button
                    onClick={() => onDelete(plant.plant_id)}
                    disabled={!isAdmin}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    title={!isAdmin ? 'Bạn không có quyền xóa nhà kho này' : 'Xóa nhà kho'}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
