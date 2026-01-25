'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NewsletterPopup from '@/components/NewsletterPopup';
import { AnimatePresence } from 'framer-motion';
import PageTransition from '@/components/PageTransition';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hide header/footer on admin routes, login/register pages
  const isAdminRoute = pathname.startsWith('/admin');
  const isAuthRoute = pathname === '/login' || pathname === '/register';
  const shouldHideHeaderFooter = isAdminRoute || isAuthRoute;

  return (
    <>
      {!shouldHideHeaderFooter && <Header />}
      <main className="flex-1 flex flex-col">
        {/* <AnimatePresence mode="wait" initial={false}>
          <PageTransition key={pathname}> */}
            {children}
        {/* </PageTransition>
        </AnimatePresence> */}
      </main>
      {!shouldHideHeaderFooter && <Footer />}
      {!shouldHideHeaderFooter && <NewsletterPopup />}
    </>
  );
}
