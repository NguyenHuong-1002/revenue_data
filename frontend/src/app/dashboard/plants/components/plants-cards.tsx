'use client';

import { MapPin, User, Phone, Calendar, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { IPlant } from '@/lib/types/plant';

interface PlantsCardsProps {
  plants: IPlant[];
  isAdmin: boolean;
  onEdit: (plant: IPlant) => void;
  onDelete: (plantId: string) => void;
}

export function PlantsCards({ plants, isAdmin, onEdit, onDelete }: PlantsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:hidden">
      {plants.map((plant) => (
        <Card key={plant.plant_id} className="bg-card border-border shadow-sm">
          <CardContent className="p-5 space-y-4">
            <div>
              <h3 className="font-semibold text-foreground text-base">{plant.name_plant}</h3>
              <span className="text-[10px] font-mono text-muted-foreground">
                ID: {plant.plant_id}
              </span>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground border-t border-border/60 pt-3">
              <div className="flex items-center gap-2">
                <MapPin className="size-3.5 text-blue-500" />
                <span>Địa chỉ: {plant.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="size-3.5 text-purple-500" />
                <span>Người quản lý: {plant.manager_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-3.5 text-emerald-500" />
                <span>Số điện thoại: {plant.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="size-3.5" />
                <span>
                  Ngày tạo:{' '}
                  {new Date(plant.created_at).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 border-t border-border/60 pt-3">
              <Button
                onClick={() => onEdit(plant)}
                disabled={!isAdmin}
                variant="outline"
                size="sm"
                className="h-8 border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Edit className="size-3.5 mr-1.5" />
                Sửa
              </Button>
              <Button
                onClick={() => onDelete(plant.plant_id)}
                disabled={!isAdmin}
                variant="outline"
                size="sm"
                className="h-8 border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive hover:text-white cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Trash2 className="size-3.5 mr-1.5" />
                Xóa
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
