'use client';

// ===== Component danh sách tài khoản dạng Card (Mobile) =====
// Hiển thị dạng卡片, chỉ visible trên màn hình < md
// Mỗi card = 1 tài khoản với đầy đủ thông tin + nút Sửa/Xóa

import { Mail, Calendar, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getAvatarUrl } from '@/lib/avatar';
import type { IAccount } from '@/lib/types/account';

interface AccountMobileCardsProps {
  accounts: IAccount[];
  currentUser: IAccount | null;
  onEdit: (account: IAccount) => void;
  onDelete: (id: string) => void;
}

export function AccountMobileCards({ accounts, currentUser, onEdit, onDelete }: AccountMobileCardsProps) {
  return (
    // Ẩn trên desktop, hiện trên mobile (<md)
    <div className="grid grid-cols-1 gap-4 md:hidden">
      {accounts.map((account) => {
        const isSelf = currentUser?.account_id === account.account_id;
        const displayAvatar = getAvatarUrl(account.avatarURL);

        return (
          <Card key={account.account_id} className="bg-card border-border shadow-sm">
            <CardContent className="p-5 space-y-4">
              {/* Dòng 1: Avatar + Tên + Vai trò + Trạng thái */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border border-border">
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
                        <Badge variant="outline" className="bg-blue-500/5 text-blue-400 border-blue-500/20 text-[10px] py-0 px-1.5">Bạn</Badge>
                      )}
                    </div>
                    <div className="text-muted-foreground text-xs">@{account.username}</div>
                  </div>
                </div>

                {/* Badge Vai trò + Trạng thái */}
                <div className="flex flex-col items-end gap-1.5">
                  {account.role === 'ADMIN' ? (
                    <Badge variant="outline" className="bg-purple-500/5 text-purple-400 border-purple-500/20 text-xs font-semibold px-2 py-0.5">Quản trị</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-blue-500/5 text-blue-400 border-blue-500/20 text-xs font-semibold px-2 py-0.5">Nhân viên</Badge>
                  )}
                  {account.status_account === 'ACTIVE' ? (
                    <Badge variant="outline" className="bg-green-500/5 text-green-400 border-green-500/20 text-[10px] px-1.5 py-0 font-medium">Hoạt động</Badge>
                  ) : account.status_account === 'INACTIVE' ? (
                    <Badge variant="outline" className="bg-zinc-500/5 text-zinc-400 border-zinc-500/20 text-[10px] px-1.5 py-0 font-medium">Tạm ngưng</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-500/5 text-red-400 border-red-500/20 text-[10px] px-1.5 py-0 font-medium">Bị khóa</Badge>
                  )}
                </div>
              </div>

              {/* Dòng 2: Email, ngày tham gia, đăng nhập cuối */}
              <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border/60 pt-3">
                <div className="flex items-center gap-2">
                  <Mail className="size-3.5 text-muted-foreground" />
                  <span>{account.mail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="size-3.5 text-muted-foreground" />
                  <span>
                    Tham gia:{' '}
                    {new Date(account.created_at).toLocaleDateString('vi-VN', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-muted-foreground/80">Đăng nhập cuối:</span>
                  {account.last_login_at ? (
                    <span>
                      {new Date(account.last_login_at).toLocaleString('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  ) : (
                    <span className="italic text-muted-foreground/60">Chưa đăng nhập</span>
                  )}
                </div>
              </div>

              {/* Dòng 3: Nút Sửa / Xóa */}
              <div className="flex justify-end gap-2 border-t border-border/60 pt-3">
                <Button
                  onClick={() => onEdit(account)}
                  variant="outline" size="sm"
                  className="h-8 border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <Edit className="size-3.5 mr-1.5" /> Sửa
                </Button>
                <Button
                  onClick={() => onDelete(account.account_id)}
                  disabled={isSelf}
                  variant="outline" size="sm"
                  className={`h-8 border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive hover:text-white cursor-pointer ${isSelf ? 'opacity-30 cursor-not-allowed' : ''}`}
                >
                  <Trash2 className="size-3.5 mr-1.5" /> Xóa
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
