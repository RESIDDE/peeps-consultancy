import { LogOut } from "lucide-react";
import { signOut } from "@/server/actions/auth";
import { cn } from "@/lib/utils";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <form action={signOut}>
      <button type="submit" className={cn("inline-flex items-center gap-1.5 text-xs font-medium hover:underline", className)}>
        <LogOut className="size-3.5" /> Sign out
      </button>
    </form>
  );
}
