import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowDown } from "lucide-react";

export function Hero() {
  return (
    <section id="home" className="relative w-full h-screen min-h-[700px] flex flex-col justify-center overflow-hidden">
      <div className="absolute inset-0 vertical-lines bg-gradient-to-b from-background to-background/90" />
       <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />

      <div className="relative container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center space-y-6 text-center">
          <Badge variant="secondary" className="bg-black/20 border-0 text-foreground/80 py-1 px-3">
             <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Available For Impactful Work
          </Badge>
          <div className="space-y-2">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-foreground font-headline leading-tight">
              DESIGN.DEVELOP.<br/>DELIVER.
            </h1>
            <p className="mx-auto max-w-[700px] text-foreground/80 md:text-xl/relaxed">
              Future-proof web solutions custom-built to elevate your brand, drive growth, and adapt seamlessly to your evolving business goals.
            </p>
          </div>
          <div className="pt-4">
            <Button size="lg" asChild variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/#projects" prefetch={false}>
                SEE MORE <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 w-full p-8">
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between text-sm font-medium text-foreground/80">
          <Link href="/#projects" className="hover:text-foreground">SEE PORTFOLIO</Link>
          
          <div className="hidden md:flex items-center justify-center gap-4">
            <Image src="https://picsum.photos/seed/hp1/200/120" width={100} height={60} alt="Portfolio item 1" className="rounded-lg shadow-lg" data-ai-hint="plant" />
            <Image src="https://picsum.photos/seed/hp2/200/120" width={100} height={60} alt="Portfolio item 2" className="rounded-lg shadow-lg" data-ai-hint="abstract art" />
            <Image src="https://picsum.photos/seed/hp3/200/120" width={100} height={60} alt="Portfolio item 3" className="rounded-lg shadow-lg" data-ai-hint="geometric shape" />
          </div>

          <Link href="/#projects" className="flex items-center gap-2 hover:text-foreground">
            SCROLL DOWN
            <span className="bg-black/20 rounded-full p-1">
              <ArrowDown className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>

    </section>
  );
}
