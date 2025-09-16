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
  const isLoginPage = pathname === '/login' || pathname === '/admin/login';

  return (
    <div className="flex min-h-screen flex-col">
      {!isLoginPage && header}
      <main className="flex-1">{children}</main>
      {!isLoginPage && footer}
    </div>
  );
}
