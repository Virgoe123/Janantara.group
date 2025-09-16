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

const testimonials = [
  {
    quote: "Working with Verdant Vista was a game-changer for our business. Their team is professional, skilled, and incredibly responsive. The final product exceeded all our expectations.",
    name: "Sarah Johnson",
    title: "CEO, Innovate Inc.",
    avatar: "https://picsum.photos/seed/c1/100/100",
  },
  {
    quote: "The best web development agency I've ever worked with. They understood our vision perfectly and delivered a high-quality website on time and on budget. Highly recommended!",
    name: "Mark Lee",
    title: "Marketing Director, Tech Solutions",
    avatar: "https://picsum.photos/seed/c2/100/100",
  },
  {
    quote: "Their design sense is impeccable. They transformed our outdated app into a modern, user-friendly experience that our customers love. The user engagement has skyrocketed.",
    name: "Jessica Chen",
    title: "Product Manager, Creative Co.",
    avatar: "https://picsum.photos/seed/c3/100/100",
  },
];

export function Testimonials() {
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
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-4xl mx-auto py-12"
        >
          <CarouselContent>
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/1">
                <div className="p-1">
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                      <p className="text-lg italic">"{testimonial.quote}"</p>
                      <div className="mt-4 flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-ai-hint="client portrait"/>
                          <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
}
