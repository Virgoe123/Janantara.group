
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getTeamMembers } from "@/lib/actions";

export async function About() {
  const { data: teamMembers, error } = await getTeamMembers();

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
          {error || !teamMembers || teamMembers.length === 0 ? (
            <p className="text-muted-foreground text-center">Our team information is currently being updated.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {teamMembers.map((member) => (
                  <div key={member.id} className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 border-2 border-primary">
                      {member.image_url && <AvatarImage src={member.image_url} alt={member.name} data-ai-hint="professional portrait" />}
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <p className="mt-2 font-semibold">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
