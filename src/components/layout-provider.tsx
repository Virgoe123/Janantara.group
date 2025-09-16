'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

export function LayoutProvider({
  header,
  footer,
  children,
}: {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/admin/login');
  const isCmsPage = pathname.startsWith('/cms');

  return (
    <div className="flex min-h-screen flex-col">
      {!isAuthPage && !isCmsPage && header}
      <main className="flex-1">{children}</main>
      {!isAuthPage && !isCmsPage && footer}
    </div>
  );
}
