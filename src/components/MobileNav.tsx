"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  PlusCircle,
  History,
  Info,
  User,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase";
import IconLogo from "@/app/assets/Icon Logo.png";
import FullLogo from "@/app/assets/Full Logo.png";

const mockHistoryItems = [
  { id: 1, query: "Date night under $50", date: "2 days ago" },
  { id: 2, query: "Family weekend activities", date: "1 week ago" },
  { id: 3, query: "Artsy cafes and museums", date: "2 weeks ago" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase.auth]);

  const isActive = (path: string) => pathname === path;

  return (
    <div className="md:hidden">
      <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-white/60 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-end">
            <div className="relative w-8 h-8 flex-shrink-0">
              <Image
                src={IconLogo}
                alt="VibePlan Icon"
                fill
                className="object-contain"
              />
            </div>
            <div className="relative h-6 w-32">
              <Image
                src={FullLogo}
                alt="VibePlan"
                fill
                className="object-contain object-left"
              />
            </div>
          </Link>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle className="text-left">
                  <Link
                    href="/"
                    className="flex items-end"
                    onClick={() => setOpen(false)}
                  >
                    <div className="relative w-8 h-8 flex-shrink-0">
                      <Image
                        src={IconLogo}
                        alt="VibePlan Icon"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="relative h-6 w-32">
                      <Image
                        src={FullLogo}
                        alt="VibePlan"
                        fill
                        className="object-contain object-left"
                      />
                    </div>
                  </Link>
                </SheetTitle>
              </SheetHeader>

              <nav className="flex flex-col space-y-4 mt-6">
                <Link href="/" onClick={() => setOpen(false)}>
                  <Button
                    variant={isActive("/") ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    <PlusCircle className="h-5 w-5 mr-2" />
                    New Activity
                  </Button>
                </Link>

                <Link href="/explore" onClick={() => setOpen(false)}>
                  <Button
                    variant={isActive("/explore") ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Compass className="h-5 w-5 mr-2" />
                    Explore
                  </Button>
                </Link>

                <div>
                  <Link href="/history" onClick={() => setOpen(false)}>
                    <Button
                      variant={isActive("/history") ? "default" : "ghost"}
                      className="w-full justify-start"
                    >
                      <History className="h-5 w-5 mr-2" />
                      History
                    </Button>
                  </Link>
                  <div className="ml-4 mt-2 space-y-1">
                    {mockHistoryItems.map((item) => (
                      <Link
                        key={item.id}
                        href="/results"
                        onClick={() => setOpen(false)}
                        className="block p-2 hover:bg-accent rounded-md"
                      >
                        <p className="text-sm font-medium">{item.query}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.date}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>

                <Separator />

                <Link href="/about" onClick={() => setOpen(false)}>
                  <Button
                    variant={isActive("/about") ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Info className="h-5 w-5 mr-2" />
                    About
                  </Button>
                </Link>

                <Link href="/profile" onClick={() => setOpen(false)}>
                  <Button
                    variant={isActive("/profile") ? "default" : "ghost"}
                    className="w-full justify-start gap-2"
                  >
                    {user?.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt="Profile"
                        className="w-5 h-5 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                    {user?.user_metadata?.full_name ||
                      user?.user_metadata?.name ||
                      "Profile"}
                  </Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </div>
  );
}
