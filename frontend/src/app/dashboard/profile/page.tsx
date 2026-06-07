'use client';

import { Edit3Icon, LockIcon, MailIcon, UserIcon, User } from 'lucide-react';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardHeader } from '@/components/dashboard-header';
import { AvatarCard } from './components/avatar-card';
import { ChangePasswordModal } from './components/change-password-modal';
import { EditInfoModal } from './components/edit-info-modal';
import { ProfileSkeleton } from './components/profile-skeleton';
import { useProfile } from './hooks/use-profile';

export default function ProfilePage() {
  const {
    fullname,
    username,
    mail,
    role,
    avatarURL,
    isLoading,
    isUploading,
    isEditInfoOpen,
    setIsEditInfoOpen,
    isChangePasswordOpen,
    setIsChangePasswordOpen,
    handleAvatarChange,
    onUpdateInfo,
    onChangePassword,
  } = useProfile();

  return (
    <div className="flex flex-1 flex-col p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col gap-6">
        <DashboardHeader
          title="Hồ sơ cá nhân"
          description="Xem và quản lý thông tin tài khoản, mật khẩu và ảnh đại diện của bạn."
          icon={User}
        />

        {isLoading ? (
          <ProfileSkeleton />
        ) : (
          <div className="grid gap-6 md:grid-cols-[260px_1fr]">
            {/* Left side: Avatar Management */}
            <div className="flex flex-col items-center gap-4">
              <AvatarCard
                fullname={fullname}
                username={username}
                role={role}
                avatarURL={avatarURL}
                isUploading={isUploading}
                onAvatarChange={handleAvatarChange}
              />
            </div>

            {/* Right side: Account Details & Actions */}
            <div className="space-y-6">
              <Card className="bg-card border-border shadow-md overflow-hidden">
                <CardHeader className="border-b border-border/60 bg-muted/10 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                        <UserIcon className="size-5 text-blue-500" />
                        Thông tin cá nhân
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground mt-1">
                        Quản lý thông tin tài khoản và phân quyền của bạn.
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-blue-500/20 text-blue-500 bg-blue-500/5 font-semibold text-xs px-2.5 py-0.5 rounded-full"
                    >
                      {role === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên'}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {/* Personal Details list */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Họ và tên */}
                    <div className="p-4 rounded-xl border border-border/50 bg-muted/5 flex items-start gap-3.5">
                      <UserIcon className="size-5 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-muted-foreground">
                          Họ và tên
                        </span>
                        <p className="text-foreground font-semibold text-sm">{fullname}</p>
                      </div>
                    </div>

                    {/* Tên đăng nhập */}
                    <div className="p-4 rounded-xl border border-border/50 bg-muted/5 flex items-start gap-3.5">
                      <span className="text-muted-foreground font-mono font-bold text-base mt-0.5 shrink-0 select-none">
                        @
                      </span>
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-muted-foreground">
                          Tên đăng nhập
                        </span>
                        <p className="text-foreground font-semibold text-sm">{username}</p>
                      </div>
                    </div>

                    {/* Địa chỉ Email */}
                    <div className="p-4 rounded-xl border border-border/50 bg-muted/5 flex items-start gap-3.5 sm:col-span-2">
                      <MailIcon className="size-5 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-muted-foreground">
                            Địa chỉ Email
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 border border-amber-500/20 bg-amber-500/5 px-1.5 py-0.5 rounded font-normal select-none">
                            <LockIcon className="size-2.5" />
                            chỉ xem
                          </span>
                        </div>
                        <p className="text-foreground font-semibold text-sm">{mail}</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer buttons */}
                  <div className="flex flex-wrap gap-3 pt-6 border-t border-border/60">
                    <Button
                      onClick={() => setIsEditInfoOpen(true)}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg hover:shadow-blue-500/10 cursor-pointer h-9 px-4 text-xs sm:text-sm"
                    >
                      <Edit3Icon className="size-4 mr-2" />
                      Chỉnh sửa thông tin
                    </Button>
                    <Button
                      onClick={() => setIsChangePasswordOpen(true)}
                      variant="outline"
                      className="border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer h-9 px-4 text-xs sm:text-sm"
                    >
                      <LockIcon className="size-4 mr-2 text-amber-500" />
                      Đổi mật khẩu
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Edit Info Popup */}
      <EditInfoModal
        isOpen={isEditInfoOpen}
        onClose={() => setIsEditInfoOpen(false)}
        defaultValues={{ fullname, username, mail }}
        onSubmit={onUpdateInfo}
      />

      {/* Change Password Popup */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        onSubmit={onChangePassword}
      />
    </div>
  );
}
