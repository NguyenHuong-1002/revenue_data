import { NotificationDropdown } from '@/components/notification-dropdown';
import { ThemeToggle } from '@/components/theme-toggle';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { DynamicBreadcrumb } from '@/components/dynamic-breadcrumb';

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-1 lg:gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
          <DynamicBreadcrumb />
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <NotificationDropdown />
        </div>
      </div>
    </header>
  );
}
