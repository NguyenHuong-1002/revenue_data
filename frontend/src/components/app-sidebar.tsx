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
import { usePathname } from 'next/navigation';
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
import { useLogout } from '@/lib/hooks/use-logout';
import { accountService } from '@/lib/services/account.service';
import { notificationService } from '@/lib/services/notification.service';

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
    {
      title: 'Thông báo',
      url: '/dashboard/notifications',
      icon: <Bell />,
    },
  ],
  analytics: [
    {
      title: 'Thống kê doanh thu',
      url: '/dashboard/revenue-stats',
      icon: <TrendingUpIcon />,
    },
    {
      title: 'Thống kê kho hàng',
      url: '/dashboard/inventory-stats',
      icon: <BoxesIcon />,
    },
    {
      title: 'Dự báo xu hướng doanh thu và tồn kho',
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
  const pathname = usePathname();
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

  const isItemActive = React.useCallback(
    (url: string) => {
      if (url === '/dashboard') {
        return pathname === '/dashboard';
      }
      return pathname === url || pathname.startsWith(url + '/');
    },
    [pathname]
  );

  const renderMenuItem = React.useCallback(
    (item: { title: string; url: string; icon: React.ReactNode }) => {
      const active = isItemActive(item.url);
      const isNotification = item.url === '/dashboard/notifications';

      return (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild tooltip={item.title} isActive={active}>
            <Link
              href={item.url}
              className={isNotification ? 'flex items-center gap-2 w-full' : undefined}
            >
              {isNotification ? (
                <span className="relative flex items-center">
                  {item.icon}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-0.5 text-[8px] font-bold text-primary-foreground leading-none">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </span>
              ) : (
                item.icon
              )}
              <span>{item.title}</span>
              {isNotification && unreadCount > 0 && (
                <span className="ml-auto text-[10px] font-semibold text-primary group-data-[collapsible=icon]:hidden">
                  {unreadCount} mới
                </span>
              )}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    },
    [isItemActive, unreadCount]
  );

  const groups = React.useMemo(() => {
    return [
      {
        label: 'Hệ thống',
        items: data.system,
      },
      {
        label: 'Phân tích & Báo cáo',
        items: data.analytics,
      },
      {
        label: 'Quản lý dữ liệu',
        items: filteredManagement,
      },
    ];
  }, [filteredManagement]);

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
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{group.items.map(renderMenuItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

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
