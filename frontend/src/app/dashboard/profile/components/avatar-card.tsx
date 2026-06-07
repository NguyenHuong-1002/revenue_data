'use client';

/* eslint-disable @next/next/no-img-element */

import { CameraIcon, UserIcon } from 'lucide-react';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { getAvatarUrl } from '@/lib/avatar';

interface AvatarCardProps {
  fullname: string;
  username: string;
  role: string;
  avatarURL: string | null;
  isUploading: boolean;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export function AvatarCard({
  fullname,
  username,
  role,
  avatarURL,
  isUploading,
  onAvatarChange,
}: AvatarCardProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <Card className="w-full bg-card border-border shadow-xl p-6 flex flex-col items-center justify-center text-center">
      <div className="relative group size-32 rounded-full overflow-hidden border-2 border-border bg-muted/20 flex items-center justify-center">
        {avatarURL ? (
          <img
            src={getAvatarUrl(avatarURL)}
            alt="Avatar"
            className="h-full w-full object-cover group-hover:brightness-50 transition-all duration-300"
          />
        ) : (
          <UserIcon className="size-16 text-muted-foreground group-hover:brightness-50 transition-all duration-300" />
        )}

        {/* Upload overlay */}
        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 bg-black/60 text-white text-xs font-semibold cursor-pointer transition-opacity duration-300"
        >
          <CameraIcon className="size-5 mb-1" />
          {isUploading ? 'Tải lên...' : 'Thay đổi ảnh'}
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={onAvatarChange}
        accept="image/*"
        className="hidden"
      />

      <h3 className="mt-4 font-bold text-foreground text-sm">{fullname || 'Tên tài khoản'}</h3>
      <p className="text-xs text-muted-foreground mt-0.5">@{username}</p>

      <div className="mt-4 flex justify-center">
        <Badge
          variant="outline"
          className="border-blue-500/20 text-blue-400 bg-blue-500/5 font-semibold text-xs px-2.5 py-0.5"
        >
          {role === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên'}
        </Badge>
      </div>
    </Card>
  );
}
