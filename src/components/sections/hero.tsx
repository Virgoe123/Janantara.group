import Link from "next/link";
import { Button } from "@/components/ui/button";

const GradientOrb = ({ className, ...props }: { className?: string, style?: React.CSSProperties }) => {
  return (
    <div
      className={cn("absolute -z-10 rounded-full bg-gradient-to-tr from-primary/50 to-primary/20 blur-2xl", className)}
      {...props}
    />
  );
};

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="absolute inset-0 subtle-grid-pattern" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />

      {/* Floating Gradient Orbs */}
      <GradientOrb className="h-64 w-64 top-1/4 left-1/4 animate-float" style={{ animationDelay: '0s', animationDuration: '28s' }} />
      <GradientOrb className="h-72 w-72 top-1/2 right-1/4 animate-float" style={{ animationDelay: '4s', animationDuration: '32s' }} />
      <GradientOrb className="hidden md:block h-48 w-48 bottom-10 left-20 animate-float" style={{ animationDelay: '8s', animationDuration: '24s' }} />
      <GradientOrb className="hidden md:block h-56 w-56 top-0 -right-20 animate-float" style={{ animationDelay: '6s', animationDuration: '30s' }} />

      <div className="relative container mx-auto px-4 md:px-6 py-32 md:py-48 lg:py-56">
        <div className="flex flex-col items-center space-y-6 text-center">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60 font-headline leading-tight">
              Crafting Digital Excellence
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
              We build modern, scalable, and beautiful web experiences with purpose and precision, turning your vision into a reality that captivates and performs.
            </p>
          </div>
          <div className="space-x-4 pt-4">
            <Button size="lg" asChild variant="default">
              <Link href="/#projects" prefetch={false}>
                View Our Work
              </Link>
            </Button>
            <Button size="lg" asChild className="wave-button-green">
              <Link href="/#contact" prefetch={false}>
                Get in Touch
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// Helper to combine class names
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
