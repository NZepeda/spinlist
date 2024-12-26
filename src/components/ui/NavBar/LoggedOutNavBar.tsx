import { Button } from "@/components/core/button";
import { Link } from "lucide-react";

export const LoggedOutNavBar = () => {
  return (
    <nav className="ml-auto flex items-center gap-4 sm:gap-6">
      <Button variant="ghost" asChild>
        <Link href="/login">Log In</Link>
      </Button>
      <Button asChild>
        <Link href="/signup">Sign Up</Link>
      </Button>
    </nav>
  );
};
