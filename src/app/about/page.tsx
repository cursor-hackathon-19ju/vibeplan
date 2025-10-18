"use client"

import { Sidebar } from "@/components/Sidebar"
import { MobileNav } from "@/components/MobileNav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Target, Heart, Zap, AlertCircle } from "lucide-react"
import { useEffect, useRef } from "react"

export default function AboutPage() {
  const telegramVideoRef = useRef<HTMLVideoElement>(null)
  const tiktokVideoRef = useRef<HTMLVideoElement>(null)
  const lemon8VideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Set playback rate to 2x for all videos
    if (telegramVideoRef.current) {
      telegramVideoRef.current.playbackRate = 2.0
    }
    if (tiktokVideoRef.current) {
      tiktokVideoRef.current.playbackRate = 2.0
    }
    if (lemon8VideoRef.current) {
      lemon8VideoRef.current.playbackRate = 2.0
    }
  }, [])
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <div className="flex-1">
        <MobileNav />
        
        <main className="container max-w-4xl mx-auto p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-serif italic mb-2">
              About VibePlan
            </h1>
            <p className="text-muted-foreground text-lg">
              AI that plans your weekend
            </p>
          </div>

          <div className="space-y-6">
            {/* Pain Point */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-6 w-6 text-primary" />
                  <CardTitle className="font-serif italic">Pain Point</CardTitle>
                </div>
                <CardDescription>
                  Finding activities shouldn't feel like endless scrolling
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Telegram Column */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-center text-primary">Telegram</h3>
                    <div className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden">
                      <video
                        ref={telegramVideoRef}
                        src="/assets/telechannel.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* TikTok Column */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-center text-primary">TikTok</h3>
                    <div className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden">
                      <video
                        ref={tiktokVideoRef}
                        src="/assets/tiktokscroll.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Lemon8 Column */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-center text-primary">Lemon8</h3>
                    <div className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden">
                      <video
                        ref={lemon8VideoRef}
                        src="/assets/lemon8scroll.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What is VibePlan */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                  <CardTitle className="font-serif italic">What is VibePlan?</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  VibePlan is an AI-powered activity recommendation tool designed specifically for Singapore. 
                  We help you discover the perfect activities, from casual hangouts to special date nights, 
                  tailored to your preferences, budget, and vibe.
                </p>
                <p>
                  Whether you're a broke student looking for free activities or an atas boss ready to splurge, 
                  VibePlan has something for everyone.
                </p>
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-6 w-6 text-primary" />
                  <CardTitle className="font-serif italic">How It Works</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Tell Us Your Preferences</h3>
                      <p className="text-sm text-muted-foreground">
                        Select activity types, budget, number of people, and any special preferences like MBTI or nightlife options.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Describe Your Vibe</h3>
                      <p className="text-sm text-muted-foreground">
                        Use natural language to describe what you're looking for. Our AI understands context and nuance.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Get Personalized Recommendations</h3>
                      <p className="text-sm text-muted-foreground">
                        Our AI analyzes your input and curates a list of activities perfect for your weekend plans.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Our Mission */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Target className="h-6 w-6 text-primary" />
                  <CardTitle className="font-serif italic">Our Mission</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p>
                  We believe everyone deserves to make the most of their weekends. VibePlan was created to 
                  eliminate the "What should we do this weekend?" dilemma and help Singaporeans discover 
                  both hidden gems and popular spots that match their unique preferences.
                </p>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Heart className="h-6 w-6 text-primary" />
                  <CardTitle className="font-serif italic">Key Features</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>AI-powered personalized recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Budget-aware suggestions from free to premium activities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Curated database of Singapore activities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>MBTI-based personality matching</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Optional nightlife and drinks recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Search history to revisit past recommendations</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Tech Stack */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif italic">Built With</CardTitle>
                <CardDescription>Cutting-edge AI and web technologies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-primary">Frontend & UI</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'shadcn/ui'].map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-secondary rounded-full text-sm font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-primary">AI & Machine Learning</h4>
                  <div className="flex flex-wrap gap-2">
                    {['OpenAI GPT', 'ChromaDB', 'RAG System', 'Vector Search'].map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-secondary rounded-full text-sm font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-primary">Data & APIs</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Supabase', 'Google Maps API', 'Exa API', 'Telegram API'].map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-secondary rounded-full text-sm font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-primary">Automation & Scraping</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Selenium', 'Telethon', 'Web Scraping', 'Social Monitoring'].map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-secondary rounded-full text-sm font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

