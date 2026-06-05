'use client';

// ===== Component bảng danh sách tài khoản (Desktop) =====
// Hiển thị dạng table, chỉ visible trên màn hình >= md
// Mỗi dòng = 1 tài khoản với avatar, thông tin, nút sửa/xóa

import { Mail, Calendar, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getAvatarUrl } from '@/lib/avatar';
import type { IAccount } from '@/lib/types/account';

interface AccountTableProps {
  accounts: IAccount[];
  currentUser: IAccount | null;
  onEdit: (account: IAccount) => void;
  onDelete: (id: string) => void;
}

export function AccountTable({ accounts, currentUser, onEdit, onDelete }: AccountTableProps) {
  return (
    // Ẩn trên mobile, hiện trên md+ (hidden md:block)
    <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card shadow-md">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/20 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            <th className="px-6 py-4">Thành viên</th>
            <th className="px-6 py-4">Liên hệ</th>
            <th className="px-6 py-4">Vai trò</th>
            <th className="px-6 py-4">Trạng thái</th>
            <th className="px-6 py-4">Hoạt động cuối</th>
            <th className="px-6 py-4">Ngày tham gia</th>
            <th className="px-6 py-4 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-sm text-foreground">
          {accounts.map((account) => {
            const isSelf = currentUser?.account_id === account.account_id;
            const displayAvatar = getAvatarUrl(account.avatarURL);

            return (
              <tr key={account.account_id} className="hover:bg-muted/10 transition-colors">
                {/* Cột Avatar + Họ tên + Username */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border">
                      {displayAvatar ? (
                        <AvatarImage src={displayAvatar} alt={account.fullname} />
                      ) : null}
                      <AvatarFallback className="bg-blue-500/10 text-blue-500 font-semibold uppercase">
                        {account.fullname.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-foreground flex items-center gap-1.5">
                        {account.fullname}
                        {isSelf && (
                          <Badge
                            variant="outline"
                            className="bg-blue-500/5 text-blue-400 border-blue-500/20 text-[10px] py-0 px-1.5 font-normal"
                          >
                            Bạn
                          </Badge>
                        )}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        @{account.username}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Cột Email */}
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Mail className="size-3.5" />
                    {account.mail}
                  </span>
                </td>

                {/* Cột Vai trò (ADMIN/STAFF) */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {account.role === 'ADMIN' ? (
                    <Badge variant="outline" className="bg-purple-500/5 text-purple-400 border-purple-500/20 font-semibold px-2 py-0.5">Quản trị viên</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-blue-500/5 text-blue-400 border-blue-500/20 font-semibold px-2 py-0.5">Nhân viên</Badge>
                  )}
                </td>

                {/* Cột Trạng thái (ACTIVE/INACTIVE/LOCKED) */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {account.status_account === 'ACTIVE' ? (
                    <Badge variant="outline" className="bg-green-500/5 text-green-400 border-green-500/20 font-semibold px-2 py-0.5">Hoạt động</Badge>
                  ) : account.status_account === 'INACTIVE' ? (
                    <Badge variant="outline" className="bg-zinc-500/5 text-zinc-400 border-zinc-500/20 font-semibold px-2 py-0.5">Tạm ngưng</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-500/5 text-red-400 border-red-500/20 font-semibold px-2 py-0.5">Bị khóa</Badge>
                  )}
                </td>

                {/* Cột Lần đăng nhập cuối */}
                <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                  {account.last_login_at ? (
                    <span className="text-xs">
                      {new Date(account.last_login_at).toLocaleString('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground/60 italic">Chưa đăng nhập</span>
                  )}
                </td>

                {/* Cột Ngày tham gia */}
                <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="size-3.5" />
                    {new Date(account.created_at).toLocaleDateString('vi-VN', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                    })}
                  </span>
                </td>

                {/* Cột Thao tác (Sửa / Xóa) */}
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex justify-end items-center gap-2">
                    <Button
                      onClick={() => onEdit(account)}
                      variant="ghost" size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Sửa thông tin"
                    >
                      <Edit className="size-4" />
                    </Button>
                    <Button
                      onClick={() => onDelete(account.account_id)}
                      disabled={isSelf}
                      variant="ghost" size="icon"
                      className={`h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer ${isSelf ? 'opacity-30 cursor-not-allowed' : ''}`}
                      title={isSelf ? 'Không thể tự xóa bản thân' : 'Xóa tài khoản'}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
