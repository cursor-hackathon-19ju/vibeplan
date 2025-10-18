"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { 
  ChevronLeft, 
  ChevronRight, 
  PlusCircle, 
  History, 
  Info, 
  User,
  ChevronDown
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible"
import { createClient } from "@/lib/supabase"
import IconLogo from "@/app/assets/Icon Logo.png"
import FullLogo from "@/app/assets/Full Logo.png"

const mockHistoryItems = [
  { id: 1, query: "Date night under $50", date: "2 days ago" },
  { id: 2, query: "Family weekend activities", date: "1 week ago" },
  { id: 3, query: "Artsy cafes and museums", date: "2 weeks ago" },
]

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true)
  const [historyOpen, setHistoryOpen] = useState(true)
  const [user, setUser] = useState<any>(null)
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase.auth])

  const isActive = (path: string) => pathname === path

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-primary/20 bg-white/60 backdrop-blur-md h-screen sticky top-0 transition-all duration-300",
        isExpanded ? "w-64" : "w-20"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center border-b border-primary/20 transition-all duration-300",
        isExpanded ? "justify-between p-4 h-16" : "justify-center p-4 h-20"
      )}>
        {isExpanded ? (
          <>
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
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-primary/10"
              onClick={() => setIsExpanded(false)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <div 
            className="w-full flex justify-center cursor-pointer"
            onClick={() => setIsExpanded(true)}
          >
            <Link href="/" onClick={(e) => e.stopPropagation()}>
              <div className="relative w-12 h-12">
                <Image
                  src={IconLogo}
                  alt="VibePlan"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav 
        className={cn(
          "flex-1 space-y-2 flex flex-col transition-all duration-300",
          isExpanded ? "p-4" : "p-2 cursor-pointer"
        )}
        onClick={(e) => {
          if (!isExpanded && !(e.target as HTMLElement).closest('a, button')) {
            setIsExpanded(true)
          }
        }}
      >
        {/* New Activity */}
        <Link href="/" onClick={(e) => e.stopPropagation()}>
          <Button
            variant={isActive("/") ? "default" : "ghost"}
            className={cn(
              "w-full justify-start",
              !isExpanded && "justify-center p-2"
            )}
          >
            <PlusCircle className="h-5 w-5" />
            {isExpanded && <span className="ml-2">New Activity</span>}
          </Button>
        </Link>

        {/* History Collapsible Dropdown */}
        {isExpanded ? (
          <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant={isActive("/history") ? "default" : "ghost"}
                className="w-full justify-between"
              >
                <div className="flex items-center">
                  <History className="h-5 w-5" />
                  <span className="ml-2">History</span>
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  historyOpen && "rotate-180"
                )} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-1">
              <div className="ml-6 border-l-2 border-border pl-2 space-y-1">
                {mockHistoryItems.map((item) => (
                  <Link key={item.id} href="/results" onClick={(e) => e.stopPropagation()}>
                    <div className="px-2 py-2 hover:bg-accent rounded-md cursor-pointer text-sm">
                      <p className="font-medium truncate">{item.query}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                  </Link>
                ))}
                <Link href="/history" onClick={(e) => e.stopPropagation()}>
                  <div className="px-2 py-2 hover:bg-accent rounded-md cursor-pointer text-sm font-medium text-[#25404D] underline">
                    View all history
                  </div>
                </Link>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <Link href="/history" onClick={(e) => e.stopPropagation()}>
            <Button
              variant={isActive("/history") ? "default" : "ghost"}
              className="w-full justify-center p-2"
            >
              <History className="h-5 w-5" />
            </Button>
          </Link>
        )}

        {/* Spacer to push bottom items down */}
        <div className="flex-1" />

        <Separator className="my-2 bg-primary/20" />

        {/* About */}
        <Link href="/about" onClick={(e) => e.stopPropagation()}>
          <Button
            variant={isActive("/about") ? "default" : "ghost"}
            className={cn(
              "w-full justify-start",
              !isExpanded && "justify-center p-2"
            )}
          >
            <Info className="h-5 w-5" />
            {isExpanded && <span className="ml-2">About</span>}
          </Button>
        </Link>

        {/* Profile */}
        <Link href="/profile" onClick={(e) => e.stopPropagation()}>
          <Button
            variant={isActive("/profile") ? "default" : "ghost"}
            className={cn(
              "w-full justify-start gap-2",
              !isExpanded && "justify-center p-2"
            )}
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
            {isExpanded && (
              <span className="truncate">
                {user?.user_metadata?.full_name || user?.user_metadata?.name || 'Profile'}
              </span>
            )}
          </Button>
        </Link>
      </nav>
    </aside>
  )
}

