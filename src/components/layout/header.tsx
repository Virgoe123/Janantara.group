"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const Logo = ({ scrolled }: { scrolled: boolean }) => (
  <Link href="/" className="flex items-center gap-2" prefetch={false}>
    <Image src="https://res.cloudinary.com/dye07cjmn/image/upload/v1757992101/96b46217-0642-41b8-b06a-0ba5cb0d6572.png" alt="Janantara Logo" width={32} height={32} />
    <span className={cn(
      "text-xl font-bold tracking-tight",
      scrolled ? "text-foreground" : "text-[#F9F4F0]"
    )}>
      Janantara
    </span>
  </Link>
);

const NavLinks = ({
  className,
  onLinkClick,
  scrolled
}: {
  className?: string;
  onLinkClick?: () => void;
  scrolled: boolean;
}) => (
  <nav className={className}>
    <Link
      href="/#home"
      className={cn("text-sm font-medium transition-colors", scrolled ? "text-muted-foreground hover:text-foreground" : "text-[#F9F4F0]/80 hover:text-[#F9F4F0]")}
      onClick={onLinkClick}
      prefetch={false}
    >
      HOME
    </Link>
    <Link
      href="/#services"
      className={cn("text-sm font-medium transition-colors", scrolled ? "text-muted-foreground hover:text-foreground" : "text-[#F9F4F0]/80 hover:text-[#F9F4F0]")}
      onClick={onLinkClick}
      prefetch={false}
    >
      SERVICES
    </Link>
    <Link
      href="/#projects"
      className={cn("text-sm font-medium transition-colors", scrolled ? "text-muted-foreground hover:text-foreground" : "text-[#F9F4F0]/80 hover:text-[#F9F4F0]")}
      onClick={onLinkClick}
      prefetch={false}
    >
      PROJECTS
    </Link>
    <Link
      href="/#about"
      className={cn("text-sm font-medium transition-colors", scrolled ? "text-muted-foreground hover:text-foreground" : "text-[#F9F4F0]/80 hover:text-[#F9F4F0]")}
      onClick={onLinkClick}
      prefetch={false}
    >
      ABOUT
    </Link>
    <Link
      href="/#testimonials"
      className={cn("text-sm font-medium transition-colors", scrolled ? "text-muted-foreground hover:text-foreground" : "text-[#F9F4F0]/80 hover:text-[#F9F4F0]")}
      onClick={onLinkClick}
      prefetch={false}
    >
      TESTIMONIALS
    </Link>
    <Link
      href="/#contact"
      className={cn("text-sm font-medium transition-colors", scrolled ? "text-muted-foreground hover:text-foreground" : "text-[#F9F4F0]/80 hover:text-[#F9F4F0]")}
      onClick={onLinkClick}
      prefetch={false}
    >
      CONTACT
    </Link>
  </nav>
);

const HeaderContent = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
        const isScrolled = window.scrollY > 10;
        if (isScrolled !== scrolled) {
            setScrolled(isScrolled);
        }
        };

        document.addEventListener("scroll", handleScroll);
        return () => {
        document.removeEventListener("scroll", handleScroll);
        };
    }, [scrolled]);

    const isMobile = useIsMobile();
    const [isOpen, setIsOpen] = React.useState(false);

    if (isMobile === undefined) return <div className="h-16 md:h-20" />;

    if (isMobile) {
        return (
            <header className={cn(
                "flex h-16 items-center justify-between px-4 md:hidden fixed top-0 z-50 w-full transition-all duration-300",
                scrolled ? "bg-background shadow-md" : "bg-transparent"
            )}>
              <Logo scrolled={scrolled} />
              <div className="flex items-center gap-2">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MenuIcon className={cn("h-6 w-6", scrolled ? "text-foreground" : "text-white")} />
                      <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="bg-background">
                    <SheetHeader>
                      <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col gap-6 p-6">
                       <Logo scrolled={true} />
                       <NavLinks
                        className="flex flex-col gap-4"
                        onLinkClick={() => setIsOpen(false)}
                        scrolled={true}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </header>
        )
    }

    return (
        <header className={cn(
            "hidden h-20 items-center justify-between px-4 md:flex md:px-8 fixed top-0 z-50 w-full transition-all duration-300",
            scrolled ? "bg-background shadow-md" : "bg-transparent"
        )}>
            <Logo scrolled={scrolled} />
            <div className="flex items-center gap-6">
                <NavLinks className="flex items-center gap-x-6 text-sm" scrolled={scrolled}/>
            </div>
        </header>
    );
};


export function Header() {
  return <HeaderContent />;
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
