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
  CirclePlusIcon,
  MailIcon,
} from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import { Button } from '@/components/ui/button';
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

const data = {
  features: [
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
      title: 'Dự báo xu hướng',
      url: '/dashboard/trend-forecast',
      icon: <TrendingUpIcon />,
    },
    {
      title: 'Quản lý Landing Page',
      url: '/dashboard/landing',
      icon: <Globe />,
    },
  ],
  dataManagement: [
    {
      title: 'Thống kê doanh thu',
      url: '/dashboard/revenue-stats',
      icon: <TrendingUpIcon />,
    },
    {
      title: 'Báo cáo doanh thu',
      url: '/dashboard/reports',
      icon: <FileChartColumnIcon />,
    },
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
      title: 'Quản lý tài khoản',
      url: '/dashboard/accounts',
      icon: <UsersIcon />,
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

  const filteredDataManagement = React.useMemo(() => {
    return data.dataManagement.filter((item) => {
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
        {/* ── Section 1: TÍNH NĂNG ── */}
        <SidebarGroup>
          <SidebarGroupLabel>Tính năng</SidebarGroupLabel>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              {/* Nút Tạo Nhanh & Hộp Thư */}
              <SidebarMenuItem className="flex items-center gap-2 mb-2 px-1">
                <SidebarMenuButton
                  tooltip="Tạo nhanh"
                  className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
                >
                  <CirclePlusIcon className="size-4" />
                  <span>Tạo nhanh</span>
                </SidebarMenuButton>
                <Button
                  size="icon"
                  className="size-8 shrink-0 group-data-[collapsible=icon]:opacity-0"
                  variant="outline"
                >
                  <MailIcon className="size-4" />
                  <span className="sr-only">Hộp thư đến</span>
                </Button>
              </SidebarMenuItem>

              {/* Các tính năng chính */}
              {data.features.map((item) => (
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

        {/* ── Section 2: DỮ LIỆU ── */}
        <SidebarGroup>
          <SidebarGroupLabel>Dữ liệu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredDataManagement.map((item) => (
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
