'use client';

// ===== Component bảng danh sách tài khoản (Desktop - Đầy đủ trường dữ liệu tối giản) =====
// Hiển thị dạng table tối giản nhưng đầy đủ các trường dữ liệu quan trọng
// Mỗi dòng = 1 tài khoản với Avatar, Họ tên, Email, Vai trò, Trạng thái, Hoạt động cuối, Ngày tham gia và Thao tác

import { Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getAvatarUrl } from '@/lib/avatar';
import type { IAccount } from '@/lib/types/account';

interface AccountTableProps {
  accounts: IAccount[];
  currentUser: IAccount | null;
  onEdit: (account: IAccount) => void;
  onDelete: (id: string) => void;
}

export function AccountTable({ accounts, currentUser, onEdit, onDelete }: AccountTableProps) {
  const [sortField, setSortField] = useState<keyof IAccount | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

  const handleSort = (field: keyof IAccount) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortIcon = (field: keyof IAccount) => {
    if (sortField !== field) {
      return (
        <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      );
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="ml-1 h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />;
    }
    return <ArrowDown className="ml-1 h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />;
  };

  const sortedAccounts = useMemo(() => {
    if (!sortField || !sortDirection) return accounts;

    return [...accounts].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];

      // Xử lý giá trị null hoặc undefined
      if (valA === undefined || valA === null) return sortDirection === 'asc' ? 1 : -1;
      if (valB === undefined || valB === null) return sortDirection === 'asc' ? -1 : 1;

      // Xử lý ngày tháng
      if (sortField === 'created_at' || sortField === 'last_login_at') {
        const timeA = new Date(valA).getTime();
        const timeB = new Date(valB).getTime();
        return sortDirection === 'asc' ? timeA - timeB : timeB - timeA;
      }

      // Xử lý chuỗi
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc'
          ? valA.localeCompare(valB, 'vi', { sensitivity: 'base' })
          : valB.localeCompare(valA, 'vi', { sensitivity: 'base' });
      }

      // Mặc định
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [accounts, sortField, sortDirection]);

  return (
    <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              onClick={() => handleSort('fullname')}
              className="cursor-pointer select-none hover:bg-muted/10 transition-colors group"
            >
              <div className="flex items-center gap-1">
                Thành viên
                {renderSortIcon('fullname')}
              </div>
            </TableHead>
            <TableHead
              onClick={() => handleSort('mail')}
              className="cursor-pointer select-none hover:bg-muted/10 transition-colors group"
            >
              <div className="flex items-center gap-1">
                Email
                {renderSortIcon('mail')}
              </div>
            </TableHead>
            <TableHead
              onClick={() => handleSort('role')}
              className="cursor-pointer select-none hover:bg-muted/10 transition-colors group"
            >
              <div className="flex items-center gap-1">
                Vai trò
                {renderSortIcon('role')}
              </div>
            </TableHead>
            <TableHead
              onClick={() => handleSort('status_account')}
              className="cursor-pointer select-none hover:bg-muted/10 transition-colors group"
            >
              <div className="flex items-center gap-1">
                Trạng thái
                {renderSortIcon('status_account')}
              </div>
            </TableHead>
            <TableHead
              onClick={() => handleSort('last_login_at')}
              className="cursor-pointer select-none hover:bg-muted/10 transition-colors group"
            >
              <div className="flex items-center gap-1">
                Hoạt động cuối
                {renderSortIcon('last_login_at')}
              </div>
            </TableHead>
            <TableHead
              onClick={() => handleSort('created_at')}
              className="cursor-pointer select-none hover:bg-muted/10 transition-colors group"
            >
              <div className="flex items-center gap-1">
                Ngày tham gia
                {renderSortIcon('created_at')}
              </div>
            </TableHead>
            <TableHead className="text-right select-none">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedAccounts.map((account) => {
            const isSelf = currentUser?.account_id === account.account_id;
            const displayAvatar = getAvatarUrl(account.avatarURL);
            const lastLoginDate = account.last_login_at ? new Date(account.last_login_at) : null;
            const lastLoginFormatted = lastLoginDate
              ? `${lastLoginDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ${lastLoginDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`
              : 'Chưa đăng nhập';

            return (
              <TableRow key={account.account_id} className="hover:bg-muted/5 transition-colors">
                {/* Cột Thành viên (Avatar + Tên + Username) */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-border shrink-0">
                      {displayAvatar ? (
                        <AvatarImage src={displayAvatar} alt={account.fullname} />
                      ) : null}
                      <AvatarFallback className="bg-blue-500/10 text-blue-500 font-semibold uppercase text-xs">
                        {account.fullname.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        {account.fullname}
                        {isSelf && (
                          <Badge
                            variant="outline"
                            className="bg-blue-500/5 text-blue-500 border-blue-500/20 text-[10px] py-0 px-1.5 font-normal h-4"
                          >
                            Bạn
                          </Badge>
                        )}
                      </span>
                      <span className="text-muted-foreground text-xs font-normal">
                        @{account.username}
                      </span>
                    </div>
                  </div>
                </TableCell>

                {/* Cột Email */}
                <TableCell className="text-xs md:text-sm text-foreground/80 font-medium">
                  {account.mail}
                </TableCell>

                {/* Cột Vai trò */}
                <TableCell>
                  {account.role === 'ADMIN' ? (
                    <Badge
                      variant="outline"
                      className="bg-purple-500/5 text-purple-600 border-purple-500/20 font-semibold px-2 py-0.5 text-xs"
                    >
                      Quản trị viên
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-blue-500/5 text-blue-600 border-blue-500/20 font-semibold px-2 py-0.5 text-xs"
                    >
                      Nhân viên
                    </Badge>
                  )}
                </TableCell>

                {/* Cột Trạng thái */}
                <TableCell>
                  {account.status_account === 'ACTIVE' ? (
                    <Badge
                      variant="outline"
                      className="bg-green-500/5 text-green-600 border-green-500/20 font-medium px-2.5 py-0.5 rounded-full text-xs"
                    >
                      Hoạt động
                    </Badge>
                  ) : account.status_account === 'INACTIVE' ? (
                    <Badge
                      variant="outline"
                      className="bg-zinc-500/5 text-zinc-500 border-zinc-500/20 font-medium px-2.5 py-0.5 rounded-full text-xs"
                    >
                      Tạm ngưng
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-red-500/5 text-red-600 border-red-500/20 font-medium px-2.5 py-0.5 rounded-full text-xs"
                    >
                      Bị khóa
                    </Badge>
                  )}
                </TableCell>

                {/* Cột Hoạt động cuối */}
                <TableCell className="text-xs text-muted-foreground font-medium">
                  {lastLoginFormatted}
                </TableCell>

                {/* Cột Ngày tham gia */}
                <TableCell className="text-xs text-muted-foreground font-medium">
                  {new Date(account.created_at).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </TableCell>

                {/* Cột Thao tác */}
                <TableCell className="text-right">
                  <div className="flex justify-end items-center gap-1">
                    <Button
                      onClick={() => onEdit(account)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Sửa thông tin"
                    >
                      <Edit className="size-4" />
                    </Button>
                    <Button
                      onClick={() => onDelete(account.account_id)}
                      disabled={isSelf}
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer ${
                        isSelf ? 'opacity-30 cursor-not-allowed' : ''
                      }`}
                      title={isSelf ? 'Không thể tự xóa bản thân' : 'Xóa tài khoản'}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
