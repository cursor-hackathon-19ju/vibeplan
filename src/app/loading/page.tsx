"use client"

export const dynamic = 'force-dynamic'

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"
import Image from "next/image"
import TelegramLogo from "@/app/assets/telegram-app-48.png"
import ExaLogo from "@/app/assets/exa.png"

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
        
        // Navigate to results page with the itinerary ID (preferred) or full data (fallback)
        const params = new URLSearchParams()
        if (result.itineraryId) {
          // Use database ID (new approach)
          params.set('id', result.itineraryId)
        }
        
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

  const thinkingSteps = [
    {
      icon: <Search className="h-6 w-6 text-primary" />,
      text: (
        <>
          Gather location information and research activity options
        </>
      ),
      delay: "0s"
    },
    {
      icon: (
        <div className="relative w-6 h-6">
          <Image src={TelegramLogo} alt="Telegram" fill className="object-contain" />
        </div>
      ),
      text: (
        <>
          Fetching the latest Telegram deals from <strong>SG Kiasu Foodies</strong>
        </>
      ),
      delay: "0.8s"
    },
    {
      icon: (
        <div className="relative w-6 h-6">
          <Image src={TelegramLogo} alt="Telegram" fill className="object-contain" />
        </div>
      ),
      text: (
        <>
          Fetching the best Telegram deals from <strong>Good-2-Go</strong>
        </>
      ),
      delay: "1.6s"
    },
    {
      icon: (
        <div className="relative w-6 h-6">
          <Image src={ExaLogo} alt="Exa" fill className="object-contain" />
        </div>
      ),
      text: (
        <>
          Searching for things to do with <strong>Exa</strong>
        </>
      ),
      delay: "2.4s"
    },
    {
      icon: (
        <div className="relative w-6 h-6">
          <Image src={ExaLogo} alt="Exa" fill className="object-contain" />
        </div>
      ),
      text: (
        <>
          Searching for food options with <strong>Exa</strong>
        </>
      ),
      delay: "3.2s"
    }
  ]

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="text-center space-y-8 max-w-2xl w-full">
        {/* Main Loading Text */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-serif">
            Let me cook... 👨‍🍳
          </h1>
          <p className="text-muted-foreground text-lg">
            Finding the perfect activities for you
          </p>
        </div>

        {/* AI Thinking Steps */}
        <div className="space-y-3 pt-8">
          {thinkingSteps.map((step, index) => (
            <Card 
              key={index}
              className="animate-thinking-step opacity-0"
              style={{ 
                animationDelay: step.delay,
                animationFillMode: 'forwards'
              }}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex-shrink-0">
                  {step.icon}
                </div>
                <p className="text-sm text-left flex-1">
                  {step.text}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
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

