"use client"

export const dynamic = 'force-dynamic'

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

function LoadingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const generateActivities = async () => {
      // Handle case where searchParams might be null during build
      if (!searchParams) {
        router.push('/')
        return
      }
      
      const data = searchParams.get('data')
      
      if (!data) {
        router.push('/')
        return
      }

      try {
        // Call API
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: data,
        })

        const result = await response.json()
        
        // Navigate to results page with the data
        const params = new URLSearchParams()
        params.set('results', JSON.stringify(result))
        router.push(`/results?${params.toString()}`)
      } catch (error) {
        console.error('Error generating activities:', error)
        router.push('/')
      }
    }

    // Simulate loading time (minimum 2 seconds for UX)
    const timer = setTimeout(generateActivities, 2000)
    return () => clearTimeout(timer)
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="text-center space-y-8 max-w-md">
        {/* Main Loading Text */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-serif">
            Let me cook... 👨‍🍳
          </h1>
          <p className="text-muted-foreground text-lg">
            Finding the perfect activities for you
          </p>
        </div>

        {/* Animated Thinking Indicator */}
        <div className="space-y-4 pt-8">
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
          </div>

          {/* Skeleton Cards */}
          <div className="space-y-3 pt-8">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>

        {/* Fun Loading Messages */}
        <p className="text-sm text-muted-foreground animate-pulse">
          Analyzing vibes and checking availability...
        </p>
      </div>
    </div>
  )
}

export default function LoadingPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><p>Loading...</p></div>}>
      <LoadingContent />
    </Suspense>
  )
}

