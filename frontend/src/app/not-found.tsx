import Link from "next/link"
import { BarChart3Icon, HomeIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="landing-surface flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <span className="flex size-16 items-center justify-center rounded-4xl bg-muted">
        <BarChart3Icon className="size-7 text-muted-foreground" />
      </span>

      <h1 className="mt-6 text-7xl font-bold tracking-tight">404</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
      </p>

      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href="/">
            <HomeIcon />
            Về trang chủ
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">
            Đến dashboard
          </Link>
        </Button>
      </div>
    </main>
  )
}
