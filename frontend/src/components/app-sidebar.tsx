'use client';

import {
  LayoutDashboardIcon,
  TrendingUpIcon,
  ChartBarIcon,
  FolderIcon,
  PackageIcon,
  UsersIcon,
  Settings2Icon,
  CircleHelpIcon,
  DatabaseIcon,
  FileChartColumnIcon,
  DockIcon,
  UserIcon,
  Globe,
  Sparkles,
  Bell,
  Building2Icon,
} from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { NavDocuments } from '@/components/nav-documents';
import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { accountService } from '@/lib/services/account.service';
import { notificationService } from '@/lib/services/notification.service';

const data = {
  navMain: [
    {
      title: 'Bảng điều khiển',
      url: '/dashboard',
      icon: <LayoutDashboardIcon />,
    },
    {
      title: 'Trợ lý AI',
      url: '/dashboard/chat',
      icon: <Sparkles />,
    },
    {
      title: 'Quản lý doanh thu',
      url: '#',
      icon: <ChartBarIcon />,
    },
    {
      title: 'Dự báo xu hướng',
      url: '#',
      icon: <TrendingUpIcon />,
    },
    {
      title: 'Quản lý Landing Page',
      url: '/dashboard/landing',
      icon: <Globe />,
    },
  ],
  navSecondary: [
    {
      title: 'Hồ sơ cá nhân',
      url: '/dashboard/profile',
      icon: <UserIcon />,
    },
    {
      title: 'Cài đặt hệ thống',
      url: '/dashboard/settings',
      icon: <Settings2Icon />,
    },
    {
      title: 'Trợ giúp & Hỗ trợ',
      url: '#',
      icon: <CircleHelpIcon />,
    },
  ],
  documents: [
    {
      name: 'Báo cáo doanh thu',
      url: '/dashboard/reports',
      icon: <FileChartColumnIcon />,
    },
    {
      name: 'Quản lý doanh số (Sale)',
      url: '/dashboard/report-sale',
      icon: <ChartBarIcon />,
    },
    {
      name: 'Quản lý tồn kho (Inventory)',
      url: '/dashboard/report-inventory',
      icon: <DatabaseIcon />,
    },
    {
      name: 'Quản lý sản phẩm',
      url: '/dashboard/products',
      icon: <FolderIcon />,
    },
    {
      name: 'Quản lý kho hàng',
      url: '/dashboard/plants',
      icon: <PackageIcon />,
    },
    {
      name: 'Quản lý chi nhánh',
      url: '/dashboard/branches',
      icon: <Building2Icon />,
    },
    {
      name: 'Quản lý tài khoản',
      url: '/dashboard/accounts',
      icon: <UsersIcon />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [userProfile, setUserProfile] = React.useState<{
    fullname: string;
    mail: string;
    avatarURL?: string | null;
    role?: string;
  }>({
    fullname: 'Đang tải...',
    mail: 'loading...',
    avatarURL: null,
    role: undefined,
  });

  const [unreadCount, setUnreadCount] = React.useState(0);

  const filteredNavMain = React.useMemo(() => {
    return data.navMain.filter((item) => {
      if (item.url === '/dashboard/accounts') {
        return userProfile.role === 'ADMIN';
      }
      return true;
    });
  }, [userProfile.role]);

  React.useEffect(() => {
    // Fetch user
    const fetchMe = async () => {
      try {
        const res = await accountService.me();
        setUserProfile(res.data);
      } catch {
        setUserProfile({ fullname: 'Người dùng', mail: 'user@system', avatarURL: null });
      }
    };

    // Fetch unread notification count
    const fetchUnread = async () => {
      try {
        const res = await notificationService.getAll(1, 100);
        const count = res.data.data.filter((n) => !n.read_at).length;
        setUnreadCount(count);
      } catch {
        // silently ignore
      }
    };

    fetchMe();
    fetchUnread();

    // Poll every 60s for new notifications
    const interval = setInterval(fetchUnread, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      {/* ── Header ── */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:p-1.5!">
              <Link href="/dashboard">
                <DockIcon className="size-5!" />
                <span className="text-base font-semibold">Quản trị hệ thống</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── Content ── */}
      <SidebarContent>
        {/* Navigation chính */}
        <NavMain items={filteredNavMain} />

        {/* Tài liệu & công cụ */}
        <NavDocuments items={data.documents} />

        {/* Thông báo — link đến trang riêng */}
        <SidebarMenu className="px-2">
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/dashboard/notifications" className="flex items-center gap-2 w-full">
                <span className="relative flex items-center">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-0.5 text-[8px] font-bold text-primary-foreground leading-none">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </span>
                <span>Thông báo</span>
                {unreadCount > 0 && (
                  <span className="ml-auto text-[10px] font-semibold text-primary">
                    {unreadCount} mới
                  </span>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Điều hướng phụ */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      {/* ── Footer ── */}
      <SidebarFooter>
        <NavUser user={userProfile} />
      </SidebarFooter>
    </Sidebar>
  );
}
