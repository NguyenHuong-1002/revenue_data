'use client';

import * as React from 'react';
import { Edit3Icon, KeyIcon, LockIcon, MailIcon, UserIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Hooks
import { useProfile } from './hooks/use-profile';

// Subcomponents
import { AvatarCard } from './components/avatar-card';
import { EditInfoModal } from './components/edit-info-modal';
import { ChangePasswordModal } from './components/change-password-modal';

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
    <div className="flex flex-1 flex-col p-6 max-w-4xl mx-auto w-full">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Hồ sơ cá nhân</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Xem và quản lý thông tin tài khoản, mật khẩu và ảnh đại diện của bạn.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
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
              <Card className="bg-card border-border shadow-xl">
                <CardHeader className="border-b border-border bg-muted/10">
                  <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                    <UserIcon className="size-4 text-blue-500" />
                    Thông tin tài khoản
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Chi tiết thông tin cá nhân của bạn trên hệ thống
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <span className="text-xs text-muted-foreground block font-medium uppercase tracking-wider">
                        Họ và tên
                      </span>
                      <span className="text-foreground font-semibold text-sm mt-1 block">
                        {fullname}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-muted-foreground block font-medium uppercase tracking-wider">
                        Tên đăng nhập
                      </span>
                      <span className="text-foreground font-semibold text-sm mt-1 block">
                        @{username}
                      </span>
                    </div>

                    <div className="sm:col-span-2">
                      <span className="text-xs text-muted-foreground block font-medium uppercase tracking-wider flex items-center gap-1.5">
                        Địa chỉ Email
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-500/70 border border-amber-500/20 bg-amber-500/5 px-1.5 py-0.5 rounded font-normal lowercase">
                          <LockIcon className="size-2.5" />
                          chỉ xem
                        </span>
                      </span>
                      <span className="text-zinc-400 text-sm mt-1 block flex items-center gap-2 font-medium">
                        <MailIcon className="size-4 text-muted-foreground" />
                        {mail}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-6 border-t border-border">
                    <Button
                      onClick={() => setIsEditInfoOpen(true)}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg hover:shadow-blue-500/10 cursor-pointer"
                    >
                      <Edit3Icon className="size-4 mr-2" />
                      Chỉnh sửa thông tin
                    </Button>
                    <Button
                      onClick={() => setIsChangePasswordOpen(true)}
                      variant="outline"
                      className="border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <KeyIcon className="size-4 mr-2 text-amber-500" />
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
