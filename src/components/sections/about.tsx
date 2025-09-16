
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const teamMembers = [
  {
    id: '1',
    name: 'Aria Wirawan',
    role: 'Lead Developer',
    image_url: PlaceHolderImages.find(img => img.id === 'team-1')?.imageUrl || "https://picsum.photos/seed/t1/100/100",
    imageHint: 'professional portrait'
  },
  {
    id: '2',
    name: 'Bima Sakti',
    role: 'UI/UX Designer',
    image_url: PlaceHolderImages.find(img => img.id === 'team-2')?.imageUrl || "https://picsum.photos/seed/t2/100/100",
    imageHint: 'person smiling'
  },
  {
    id: '3',
    name: 'Citra Lestari',
    role: 'Project Manager',
    image_url: PlaceHolderImages.find(img => img.id === 'team-3')?.imageUrl || "https://picsum.photos/seed/t3/100/100",
    imageHint: 'woman developer'
  },
  {
    id: '4',
    name: 'Dharma Putra',
    role: 'Frontend Developer',
    image_url: PlaceHolderImages.find(img => img.id === 'team-4')?.imageUrl || "https://picsum.photos/seed/t4/100/100",
    imageHint: 'man office'
  },
];


export function About() {
  return (
    <section id="about" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
      <div className="container mx-auto grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">About Janantara</h2>
          <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            We are a passionate team of developers and designers dedicated to building exceptional digital products. Our mission is to combine innovative technology with creative design to solve complex problems and deliver outstanding results for our clients.
          </p>
          <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Our core values are integrity, collaboration, and a relentless pursuit of quality. We believe in building strong partnerships and fostering a culture of continuous learning and improvement.
          </p>
        </div>
        <div className="flex flex-col items-center space-y-4">
          <h3 className="text-2xl font-bold tracking-tighter sm:text-3xl font-headline">Our Team</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {teamMembers.map((member: any) => (
                  <div key={member.id} className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 border-2 border-primary">
                      {member.image_url && <AvatarImage src={member.image_url} alt={member.name} data-ai-hint={member.imageHint} />}
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <p className="mt-2 font-semibold">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
              ))}
            </div>
        </div>
      </div>
    </section>
  );
}
