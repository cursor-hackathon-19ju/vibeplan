"use client"

export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/Sidebar"
import { MobileNav } from "@/components/MobileNav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase"
import { User, Mail, Calendar, LogOut } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)

      if (!user) {
        router.push('/login')
      }
    }

    getUser()
  }, [router, supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <MobileNav />
          <main className="container max-w-4xl mx-auto p-6 md:p-8">
            <Skeleton className="h-64 w-full" />
          </main>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <div className="flex-1">
        <MobileNav />
        
        <main className="container max-w-4xl mx-auto p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-serif italic mb-2">
              Profile
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your account settings
            </p>
          </div>

          <div className="space-y-6">
            {/* User Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif italic">Account Information</CardTitle>
                <CardDescription>
                  Your personal details from your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar and Name */}
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-semibold">
                    {user.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span>{user.email?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">
                      {user.user_metadata?.full_name || user.user_metadata?.name || 'User'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {user.app_metadata?.provider === 'google' ? 'Google Account' : 'Email Account'}
                    </p>
                  </div>
                </div>

                {/* User Details */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-muted-foreground">
                    <Mail className="h-5 w-5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Email</p>
                      <p className="text-sm">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-muted-foreground">
                    <Calendar className="h-5 w-5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Member Since</p>
                      <p className="text-sm">
                        {new Date(user.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-muted-foreground">
                    <User className="h-5 w-5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">User ID</p>
                      <p className="text-sm font-mono">{user.id.slice(0, 20)}...</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif italic">Actions</CardTitle>
                <CardDescription>
                  Manage your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  onClick={handleSignOut}
                  className="w-full sm:w-auto"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

