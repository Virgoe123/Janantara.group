"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import React from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Wind } from "lucide-react";

const Logo = () => (
  <Link href="/" className="flex items-center gap-2" prefetch={false}>
    <Wind className="h-6 w-6 text-primary" />
    <span className="text-xl font-bold tracking-tight text-foreground">
      Janantara
    </span>
  </Link>
);

const NavLinks = ({
  className,
  onLinkClick,
}: {
  className?: string;
  onLinkClick?: () => void;
}) => (
  <nav className={className}>
    <Link
      href="/#home"
      className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      onClick={onLinkClick}
      prefetch={false}
    >
      HOME
    </Link>
    <Link
      href="/#services"
      className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      onClick={onLinkClick}
      prefetch={false}
    >
      SERVICES
    </Link>
    <Link
      href="/#projects"
      className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      onClick={onLinkClick}
      prefetch={false}
    >
      PROJECTS
    </Link>
    <Link
      href="/#about"
      className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      onClick={onLinkClick}
      prefetch={false}
    >
      ABOUT
    </Link>
    <Link
      href="/#testimonials"
      className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      onClick={onLinkClick}
      prefetch={false}
    >
      TESTIMONIALS
    </Link>
    <Link
      href="/#contact"
      className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      onClick={onLinkClick}
      prefetch={false}
    >
      CONTACT
    </Link>
  </nav>
);

const DesktopHeader = () => (
  <header className="hidden h-20 items-center justify-between px-4 md:flex md:px-8 absolute top-0 z-50 w-full bg-transparent">
    <Logo />
    <div className="flex items-center gap-6">
      <NavLinks className="flex items-center gap-x-6 text-sm" />
      <ThemeToggle />
    </div>
  </header>
);

const MobileHeader = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className="flex h-16 items-center justify-between px-4 md:hidden absolute top-0 z-50 w-full bg-transparent">
      <Logo />
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <MenuIcon className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-background">
            <SheetHeader>
              <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-6 p-6">
              <Logo />
              <NavLinks
                className="flex flex-col gap-4"
                onLinkClick={() => setIsOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export function Header() {
  const isMobile = useIsMobile();
  
  if (isMobile === undefined) return <div className="h-16 md:h-20" />;

  return isMobile ? <MobileHeader /> : <DesktopHeader />;
}

function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}
