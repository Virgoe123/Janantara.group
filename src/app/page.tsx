
import { Hero } from "@/components/sections/hero";
import { Projects } from "@/components/sections/projects";
import { Services } from "@/components/sections/services";
import { About } from "@/components/sections/about";
import { Testimonials } from "@/components/sections/testimonials";
import { Contact } from "@/components/sections/contact";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: settings } = await supabase.from('contact_settings').select('key, value');

  const contactDetails = {
    whatsapp: settings?.find(s => s.key === 'whatsapp')?.value || '',
    email: settings?.find(s => s.key === 'email')?.value || '',
    instagram: settings?.find(s => s.key === 'instagram')?.value || '',
  }

  return (
    <>
      <Hero />
      <About />
      <Services />
      <Projects />
      <Testimonials />
      <Contact contactDetails={contactDetails} />
    </>
  );
}
