/* eslint-disable @next/next/no-img-element */
'use client';

import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useRegister } from '@/lib/hooks/use-register';
import { cn } from '@/lib/utils';

export function RegisterForm({ className, ...props }: React.ComponentProps<'div'>) {
  const {
    register,
    handleSubmit,
    serverError,
    successMessage,
    isSubmitting,
    formState: { errors },
  } = useRegister();

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Đăng ký tài khoản</h1>
                <p className="text-balance text-muted-foreground">
                  Tạo tài khoản mới để bắt đầu sử dụng hệ thống
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="firstName">Họ</FieldLabel>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Họ"
                    {...register('firstName')}
                    data-invalid={!!errors.firstName}
                  />
                  <FieldError errors={[errors.firstName]} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="lastName">Tên</FieldLabel>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Tên"
                    {...register('lastName')}
                    data-invalid={!!errors.lastName}
                  />
                  <FieldError errors={[errors.lastName]} />
                </Field>
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
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="Nhập địa chỉ email"
                  {...register('email')}
                  data-invalid={!!errors.email}
                />
                <FieldError errors={[errors.email]} />
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

              <Field>
                <FieldLabel htmlFor="confirmPassword">Xác nhận mật khẩu</FieldLabel>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Xác nhận mật khẩu"
                    className="pr-10"
                    {...register('confirmPassword')}
                    data-invalid={!!errors.confirmPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                <FieldError errors={[errors.confirmPassword]} />
              </Field>

              <Field>
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
                </Button>
              </Field>

              <FieldDescription className="text-center">
                Đã có tài khoản?{' '}
                <Link href="/auth/login" className="hover:text-primary">
                  Đăng nhập
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>

          <div className="relative hidden bg-muted md:block">
            <img
              src="/login_banner.png"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        Bằng cách nhấn tiếp tục, bạn đồng ý với <Link href="/terms">Điều khoản dịch vụ</Link> và{' '}
        <Link href="/privacy">Chính sách bảo mật</Link>.
      </FieldDescription>
    </div>
  );
}
