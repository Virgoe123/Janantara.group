import Link from "next/link";
import { Button } from "@/components/ui/button";

export async function Footer() {
  const user = null; // Supabase is removed

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
