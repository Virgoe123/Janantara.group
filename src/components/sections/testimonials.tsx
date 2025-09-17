
"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "../ui/skeleton";

type Testimonial = {
  id: string;
  quote: string;
  name: string;
  title: string;
  avatar_url: string | null;
  rating: number;
};

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => (
    <Card className="h-full">
        <CardContent className="p-6 flex flex-col justify-between h-full">
            <div>
            <div className="flex gap-0.5 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
            </div>
            <p className="text-muted-foreground text-base">"{testimonial.quote}"</p>
            </div>
            <div className="mt-6 flex items-center justify-between">
            <div>
                <p className="font-semibold text-sm">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.title}</p>
            </div>
            <Avatar className="h-10 w-10">
                <AvatarImage src={testimonial.avatar_url || undefined} alt={testimonial.name} data-ai-hint="client portrait"/>
                <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
            </Avatar>
            </div>
        </CardContent>
    </Card>
)

const TestimonialSkeleton = () => (
    <Card className="h-full">
        <CardContent className="p-6 flex flex-col justify-between h-full">
            <div className="space-y-4">
                <div className="flex gap-0.5">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-5 w-5" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>
            <div className="mt-6 flex items-center justify-between">
                <div>
                    <Skeleton className="h-5 w-24 mb-1" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
            </div>
        </CardContent>
    </Card>
)

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('testimonials')
            .select('*')
            .eq('is_published', true) // Only fetch published testimonials
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error("Error fetching testimonials:", error);
            setError("Could not load testimonials.");
        } else {
            setTestimonials(data as Testimonial[]);
        }
        setIsLoading(false);
    }
    fetchTestimonials();
  }, []);

  if (isLoading) {
      return (
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">What Our Clients Say</h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        We pride ourselves on building strong relationships and delivering results. Here's what our clients have to say about us.
                        </p>
                    </div>
                </div>
                <Carousel opts={{ align: "start" }} className="w-full max-w-5xl mx-auto py-12">
                    <CarouselContent className="-ml-4">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                                <TestimonialSkeleton />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>
        </section>
      )
  }

  if (testimonials.length === 0) {
      return null; // Don't render the section if there are no published testimonials
  }


  return (
    <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">What Our Clients Say</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              We pride ourselves on building strong relationships and delivering results. Here's what our clients have to say about us.
            </p>
          </div>
        </div>

        {error && <p className="text-center text-destructive py-4">{error}</p>}
        
        <Carousel
          opts={{
            align: "start",
            loop: testimonials.length > 2,
          }}
          className="w-full max-w-5xl mx-auto py-12"
        >
          <CarouselContent className="-ml-4">
             {testimonials.map((testimonial) => (
                <CarouselItem key={testimonial.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                    <TestimonialCard testimonial={testimonial} />
                </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>
    </section>
  );
}
