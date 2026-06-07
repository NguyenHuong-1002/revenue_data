/* eslint-disable @next/next/no-img-element */
'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useLogin } from '@/lib/hooks/use-login';
import { cn } from '@/lib/utils';

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const {
    register,
    handleSubmit,
    serverError,
    isSubmitting,
    watch,
    setValue,
    formState: { errors },
  } = useLogin();

  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = React.useState(false);

  // Trigger error toast popup when backend returns a server-side login failure
  React.useEffect(() => {
    if (serverError) {
      toast.error('Đăng nhập thất bại', {
        description: serverError,
        duration: 5000,
      });
    }
  }, [serverError]);

  React.useEffect(() => {
    if (searchParams && searchParams.get('unauthorized') === 'true') {
      const url = new URL(window.location.href);
      url.searchParams.delete('unauthorized');
      window.history.replaceState({}, document.title, url.pathname + url.search);

      toast.warning('Vui lòng đăng nhập để tiếp tục!', {
        description: 'Bạn cần đăng nhập tài khoản trước khi truy cập vào Bảng điều khiển.',
        duration: 5000,
      });
    }
  }, [searchParams]);

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Chào mừng trở lại</h1>
                <p className="text-balance text-muted-foreground">
                  Đăng nhập vào tài khoản của bạn
                </p>
              </div>

              <Field>
                <FieldLabel htmlFor="username">Tên đăng nhập</FieldLabel>
                <Input
                  id="username"
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  {...register('username')}
                  data-invalid={!!errors.username}
                />
                <FieldError errors={[errors.username]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu"
                    className="pr-10"
                    {...register('password')}
                    data-invalid={!!errors.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <FieldError errors={[errors.password]} />
              </Field>

              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="rememberMe"
                    checked={watch('rememberMe')}
                    onCheckedChange={(checked) => setValue('rememberMe', !!checked)}
                  />
                  <label
                    htmlFor="rememberMe"
                    className="text-xs text-muted-foreground font-medium cursor-pointer select-none"
                  >
                    Ghi nhớ đăng nhập
                  </label>
                </div>
                <a
                  href="#"
                  className="text-xs text-muted-foreground hover:text-white underline-offset-2 hover:underline"
                >
                  Quên mật khẩu?
                </a>
              </div>

              <Field>
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </Button>
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Hoặc tiếp tục với
              </FieldSeparator>

              <Button variant="outline" type="button" disabled={isSubmitting}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                <span className="sr-only">Đăng nhập với Google</span>
              </Button>

              <FieldDescription className="text-center">
                Chưa có tài khoản?{' '}
                <a href="/auth/register" className="hover:text-primary">
                  Đăng ký
                </a>
              </FieldDescription>
            </FieldGroup>
          </form>

          <div className="relative hidden bg-muted md:block">
            <img
              src="/image_auth.webp"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        Bằng cách nhấn tiếp tục, bạn đồng ý với <a href="#">Điều khoản dịch vụ</a> và{' '}
        <a href="#">Chính sách bảo mật</a>.
      </FieldDescription>
    </div>
  );
}
