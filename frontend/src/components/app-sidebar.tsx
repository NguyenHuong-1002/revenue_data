'use client';

import {
  LayoutDashboardIcon,
  TrendingUpIcon,
  ChartBarIcon,
  FolderIcon,
  PackageIcon,
  UsersIcon,
  DatabaseIcon,
  DockIcon,
  Globe,
  Sparkles,
  Bell,
  Building2Icon,
  BoxesIcon,
  UploadCloudIcon,
  LogOutIcon,
} from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import { accountService } from '@/lib/services/account.service';
import { notificationService } from '@/lib/services/notification.service';
import { useLogout } from '@/lib/hooks/use-logout';

const data = {
  system: [
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
  ],
  analytics: [
    {
      title: 'Thống kê doanh thu',
      url: '/dashboard/revenue-stats',
      icon: <TrendingUpIcon />,
    },
    {
      title: 'Thống kê & Dự báo kho hàng',
      url: '/dashboard/inventory-stats',
      icon: <BoxesIcon />,
    },
    {
      title: 'Dự báo xu hướng',
      url: '/dashboard/trend-forecast',
      icon: <TrendingUpIcon />,
    },
  ],
  management: [
    {
      title: 'Quản lý doanh số (Sale)',
      url: '/dashboard/report-sale',
      icon: <ChartBarIcon />,
    },
    {
      title: 'Quản lý tồn kho (Inventory)',
      url: '/dashboard/report-inventory',
      icon: <DatabaseIcon />,
    },
    {
      title: 'Quản lý sản phẩm',
      url: '/dashboard/products',
      icon: <FolderIcon />,
    },
    {
      title: 'Nhập dữ liệu (Excel)',
      url: '/dashboard/import',
      icon: <UploadCloudIcon />,
    },
    {
      title: 'Quản lý kho hàng',
      url: '/dashboard/plants',
      icon: <PackageIcon />,
    },
    {
      title: 'Quản lý chi nhánh',
      url: '/dashboard/branches',
      icon: <Building2Icon />,
    },
    {
      title: 'Quản lý Landing Page',
      url: '/dashboard/landing',
      icon: <Globe />,
    },
    {
      title: 'Quản lý tài khoản',
      url: '/dashboard/accounts',
      icon: <UsersIcon />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { handleLogout } = useLogout();
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

  const filteredManagement = React.useMemo(() => {
    return data.management.filter((item) => {
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
        {/* ── Section 1: HỆ THỐNG ── */}
        <SidebarGroup>
          <SidebarGroupLabel>Hệ thống</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.system.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url}>
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Thông báo */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Thông báo">
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
                      <span className="ml-auto text-[10px] font-semibold text-primary group-data-[collapsible=icon]:hidden">
                        {unreadCount} mới
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ── Section 2: PHÂN TÍCH & BÁO CÁO ── */}
        <SidebarGroup>
          <SidebarGroupLabel>Phân tích & Báo cáo</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.analytics.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url}>
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ── Section 3: QUẢN LÝ DỮ LIỆU ── */}
        <SidebarGroup>
          <SidebarGroupLabel>Quản lý dữ liệu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredManagement.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url}>
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Đăng xuất */}
        <SidebarMenu className="mt-auto">
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="Đăng xuất"
              className="text-destructive hover:text-destructive! hover:bg-destructive/10!"
            >
              <LogOutIcon />
              <span>Đăng xuất</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      {/* ── Footer ── */}
      <SidebarFooter>
        <NavUser user={userProfile} />
      </SidebarFooter>
    </Sidebar>
  );
}
