import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export async function Footer() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <footer className="border-t">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Janantara. All rights reserved.
        </p>
        {user && (
          <Button asChild variant="ghost" size="sm">
            <Link href="/cms">Go to CMS</Link>
          </Button>
        )}
      </div>
    </footer>
  );
}
