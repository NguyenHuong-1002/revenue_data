'use client';

import { MapPin, Calendar, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { IBranch } from '@/lib/types/branch';

interface BranchesTableProps {
  branches: IBranch[];
  isAdmin: boolean;
  onEdit: (branch: IBranch) => void;
  onDelete: (id: string) => void;
}

export function BranchesTable({ branches, isAdmin, onEdit, onDelete }: BranchesTableProps) {
  return (
    <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card shadow-md">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/20 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            <th className="px-6 py-4">Mã chi nhánh</th>
            <th className="px-6 py-4">Tên chi nhánh</th>
            <th className="px-6 py-4">Thành phố</th>
            <th className="px-6 py-4">Địa chỉ chi tiết</th>
            <th className="px-6 py-4">Ngày tạo</th>
            <th className="px-6 py-4">Ngày cập nhật</th>
            <th className="px-6 py-4 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-sm text-foreground">
          {branches.map((branch) => (
            <tr key={branch.store_id} className="hover:bg-muted/10 transition-colors">
              <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                {branch.store_id}
              </td>
              <td className="px-6 py-4 font-semibold text-foreground">{branch.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge
                  variant="outline"
                  className="bg-blue-50/5 text-blue-400 border-blue-500/20 px-2 py-0.5"
                >
                  <MapPin className="size-3 mr-1 inline" />
                  {branch.city}
                </Badge>
              </td>
              <td className="px-6 py-4 text-muted-foreground">
                {branch.address || <span className="text-muted-foreground/30 italic">Chưa cập nhật</span>}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                <span className="flex items-center gap-1.5 text-xs">
                  <Calendar className="size-3.5" />
                  {new Date(branch.created_at).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                <span className="flex items-center gap-1.5 text-xs">
                  <Calendar className="size-3.5" />
                  {new Date(branch.updated_at).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="flex justify-end items-center gap-2">
                  <Button
                    onClick={() => onEdit(branch)}
                    disabled={!isAdmin}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    title={
                      !isAdmin ? 'Bạn không có quyền sửa chi nhánh này' : 'Sửa thông tin'
                    }
                  >
                    <Edit className="size-4" />
                  </Button>
                  <Button
                    onClick={() => onDelete(branch.store_id)}
                    disabled={!isAdmin}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    title={
                      !isAdmin ? 'Bạn không có quyền xóa chi nhánh này' : 'Xóa chi nhánh'
                    }
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
