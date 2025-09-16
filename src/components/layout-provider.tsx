
'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login' || pathname === '/admin/login';

  return (
    <div className="flex min-h-screen flex-col">
      {!isLoginPage && <Header />}
      <main className="flex-1">{children}</main>
      {!isLoginPage && <Footer />}
    </div>
  );
}
