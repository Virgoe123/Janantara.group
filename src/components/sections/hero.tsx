import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="w-full py-24 md:py-32 lg:py-40">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none font-headline">
              Verdant Vista
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Crafting Digital Excellence with Purpose and Precision.
            </p>
          </div>
          <div className="space-x-4">
            <Button asChild>
              <Link href="/#projects" prefetch={false}>
                View Our Work
              </Link>
            </Button>
            <Button variant="secondary" asChild>
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
