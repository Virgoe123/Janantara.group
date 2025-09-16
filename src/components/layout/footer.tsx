
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function Footer() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { session }} = await supabase.auth.getSession();

  return (
    <footer className="border-t">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Janantara. All rights reserved.
        </p>
        {session && (
          <Button asChild variant="ghost" size="sm">
            <Link href="/cms">Go to CMS</Link>
          </Button>
        )}
      </div>
    </footer>
  );
}
