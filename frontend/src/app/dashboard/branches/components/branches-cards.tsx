'use client';

import { MapPin, Calendar, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { IBranch } from '@/lib/types/branch';

interface BranchesCardsProps {
  branches: IBranch[];
  isAdmin: boolean;
  onEdit: (branch: IBranch) => void;
  onDelete: (id: string) => void;
}

export function BranchesCards({ branches, isAdmin, onEdit, onDelete }: BranchesCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:hidden">
      {branches.map((branch) => (
        <Card key={branch.store_id} className="bg-card border-border shadow-sm">
          <CardContent className="p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-foreground text-base">{branch.name}</h3>
                <span className="text-[10px] font-mono text-muted-foreground">
                  ID: {branch.store_id}
                </span>
              </div>
              <Badge
                variant="outline"
                className="bg-blue-50/5 text-blue-400 border-blue-500/20 px-2 py-0.5 text-xs"
              >
                <MapPin className="size-3 mr-1 inline" />
                {branch.city}
              </Badge>
            </div>

            <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border/60 pt-3">
              {branch.address && (
                <div className="flex items-start gap-1.5 mb-2.5 bg-muted/30 p-2 rounded-lg border border-border/40 text-foreground">
                  <MapPin className="size-3.5 text-blue-500 shrink-0 mt-0.5" />
                  <span className="leading-tight">{branch.address}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="size-3.5" />
                <span>
                  Ngày tạo:{' '}
                  {new Date(branch.created_at).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="size-3.5" />
                <span>
                  Cập nhật:{' '}
                  {new Date(branch.updated_at).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 border-t border-border/60 pt-3">
              <Button
                onClick={() => onEdit(branch)}
                disabled={!isAdmin}
                variant="outline"
                size="sm"
                className="h-8 border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Edit className="size-3.5 mr-1.5" />
                Sửa
              </Button>
              <Button
                onClick={() => onDelete(branch.store_id)}
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
