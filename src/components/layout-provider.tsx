
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
  const isReviewPage = pathname.startsWith('/review');

  const showLayout = !isAuthPage && !isCmsPage && !isReviewPage;

  return (
    <div className="flex min-h-screen flex-col">
      {showLayout && header}
      <main className="flex-1">{children}</main>
      {showLayout && footer}
    </div>
  );
}
