"use client"

import { useState } from "react"
import Link from "next/link"
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
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

const mockHistoryItems = [
  { id: 1, query: "Date night under $50", date: "2 days ago" },
  { id: 2, query: "Family weekend activities", date: "1 week ago" },
  { id: 3, query: "Artsy cafes and museums", date: "2 weeks ago" },
]

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true)
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r bg-white h-screen sticky top-0 transition-all duration-300",
        isExpanded ? "w-64" : "w-20"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 h-16 border-b">
        {isExpanded && (
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="font-serif italic text-xl">VibePlan</span>
          </Link>
        )}
        {!isExpanded && (
          <Link href="/" className="w-full flex justify-center">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
          </Link>
        )}
      </div>

      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-white shadow-md"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {/* New Activity */}
        <Link href="/">
          <Button
            variant={isActive("/") ? "default" : "ghost"}
            className={cn(
              "w-full justify-start",
              !isExpanded && "justify-center px-2"
            )}
          >
            <PlusCircle className="h-5 w-5" />
            {isExpanded && <span className="ml-2">New Activity</span>}
          </Button>
        </Link>

        {/* History Dropdown */}
        {isExpanded ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={isActive("/history") ? "default" : "ghost"}
                className="w-full justify-between"
              >
                <div className="flex items-center">
                  <History className="h-5 w-5" />
                  <span className="ml-2">History</span>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {mockHistoryItems.map((item) => (
                <DropdownMenuItem key={item.id} asChild>
                  <Link href="/history" className="cursor-pointer">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{item.query}</span>
                      <span className="text-xs text-muted-foreground">{item.date}</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
              <Separator className="my-1" />
              <DropdownMenuItem asChild>
                <Link href="/history" className="cursor-pointer">
                  View all history
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/history">
            <Button
              variant={isActive("/history") ? "default" : "ghost"}
              className="w-full justify-center px-2"
            >
              <History className="h-5 w-5" />
            </Button>
          </Link>
        )}

        <Separator className="my-2" />

        {/* About */}
        <Link href="/about">
          <Button
            variant={isActive("/about") ? "default" : "ghost"}
            className={cn(
              "w-full justify-start",
              !isExpanded && "justify-center px-2"
            )}
          >
            <Info className="h-5 w-5" />
            {isExpanded && <span className="ml-2">About</span>}
          </Button>
        </Link>

        {/* Profile */}
        <Link href="/profile">
          <Button
            variant={isActive("/profile") ? "default" : "ghost"}
            className={cn(
              "w-full justify-start",
              !isExpanded && "justify-center px-2"
            )}
          >
            <User className="h-5 w-5" />
            {isExpanded && <span className="ml-2">Profile</span>}
          </Button>
        </Link>
      </nav>
    </aside>
  )
}

