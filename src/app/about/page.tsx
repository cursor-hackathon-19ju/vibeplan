import { Sidebar } from "@/components/Sidebar"
import { MobileNav } from "@/components/MobileNav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Target, Heart, Zap } from "lucide-react"

export default function AboutPage() {
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
                <CardDescription>Modern technologies for the best experience</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'shadcn/ui', 'Supabase'].map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-secondary rounded-full text-sm font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

