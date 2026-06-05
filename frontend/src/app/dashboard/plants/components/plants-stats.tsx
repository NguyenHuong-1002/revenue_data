'use client';

import { Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface PlantsStatsProps {
  totalPlants: number;
}

export function PlantsStats({ totalPlants }: PlantsStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-card border-border shadow-md">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-muted-foreground text-sm font-medium">Tổng số nhà kho</span>
            <p className="text-3xl font-bold text-foreground">{totalPlants}</p>
          </div>
          <div className="size-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Package className="size-6" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
