
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowDown } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import HeroProjectCarousel from "./hero-project-carousel";
import TypingTitle from "./typing-title";

type Project = {
  id: string;
  image_url: string | null;
  title: string;
};

export async function Hero() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: projects } = await supabase
    .from('projects')
    .select('id, title, image_url')
    .order('created_at', { ascending: false })
    .limit(10);
    
  return (
    <section id="home" className="relative w-full h-screen min-h-[700px] flex flex-col items-center overflow-hidden bg-[#11793A]">
      <div className="absolute inset-0 subtle-grid-pattern opacity-20" />
      
      <div className="relative container mx-auto px-4 md:px-6 z-30 flex-1 flex flex-col items-center justify-center pb-32">
          <div className="flex flex-col items-center space-y-6 text-center">
            <div className="space-y-2">
                <div className="min-h-[180px] md:min-h-[220px] flex items-center justify-center">
                   <TypingTitle />
                </div>
              <p className="mx-auto max-w-[700px] text-[#F9F4F0]/80 md:text-xl/relaxed">
                From the first sketch to the final launch, we make sure your project looks great and works even better
              </p>
            </div>
            <div className="pt-4">
              <Button size="lg" asChild className="wave-button-green chat-bubble-button">
                <Link href="/#contact" prefetch={false}>
                  Let's Talk
                </Link>
              </Button>
            </div>
          </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-background to-transparent z-20" />
      <div className="absolute bottom-0 w-full p-8 z-40">
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between text-sm font-medium">
          <Link href="/#projects" className="flex items-center gap-2 hover:text-primary text-foreground">
            SCROLL DOWN
            <span className="bg-black/10 rounded-full p-1 border border-foreground/20">
              <ArrowDown className="h-4 w-4" />
            </span>
          </Link>
          
          <HeroProjectCarousel projects={projects as Project[] || []} />

          <Link href="/#projects" className="hover:text-primary text-foreground">SEE PORTFOLIO</Link>
        </div>
      </div>

    </section>
  );
}
