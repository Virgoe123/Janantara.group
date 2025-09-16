import Link from "next/link";
import { Button } from "@/components/ui/button";

const Shape = ({ as, className, ...props }: { as: 'div' | 'span', className?: string, style?: React.CSSProperties }) => {
  const Component = as;
  return <Component className={cn("absolute -z-10 opacity-50", className)} {...props} />;
}

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="absolute inset-0 subtle-grid-pattern" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />

      {/* Floating Shapes */}
      <Shape as="div" className="h-32 w-32 rounded-full bg-primary/10 top-1/4 left-1/4 animate-float" style={{ animationDelay: '0s' }}/>
      <Shape as="div" className="h-48 w-48 rounded-lg bg-primary/5 top-1/2 right-1/2 animate-float" style={{ transform: 'rotate(45deg)', animationDelay: '2s' }} />
      <Shape as="div" className="h-20 w-20 border-2 border-primary/20 bottom-1/4 left-1/3 animate-float" style={{ animationDelay: '4s' }} />
       <Shape as="div" className="hidden md:block h-64 w-64 border-4 border-primary/10 rounded-full top-0 -right-20 animate-float" style={{ animationDelay: '1s' }} />
      <Shape as="div" className="hidden md:block h-40 w-40 bg-primary/5 bottom-10 left-20 animate-float" style={{ animationDelay: '3s' }} />

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
            <Button size="lg" asChild className="wave-button">
              <Link href="/#projects" prefetch={false}>
                View Our Work
                <span className="wave-top"></span>
                <span className="wave-bottom"></span>
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
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
