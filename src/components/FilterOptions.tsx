"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Copy, Check, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"

const activityTypes = [
  "Outdoor",
  "Sports",
  "Shopping",
  "Food",
  "Museums",
  "Thrift Store",
  "Artsy",
  "Games",
]

const mbtiTypes = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
]

const samplePrompts = [
  "Plan a date under $50 with food, something artsy, and outdoors.",
  "Weekend brunch spots with good vibes for 4 people.",
  "Chill activities for introverts under $30.",
  "Adventurous outdoor activities with a spicy nightlife twist.",
]

const budgetLabels = ["Broke Student", "Budget-Friendly", "Moderate", "Comfortable", "Atas Boss"]

export function FilterOptions() {
  const router = useRouter()
  const [selectedActivities, setSelectedActivities] = useState<string[]>([])
  const [numPax, setNumPax] = useState("")
  const [budget, setBudget] = useState([2])
  const [mbti, setMbti] = useState("")
  const [spicy, setSpicy] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")

  const toggleActivity = (activity: string) => {
    setSelectedActivities((prev) =>
      prev.includes(activity)
        ? prev.filter((a) => a !== activity)
        : [...prev, activity]
    )
  }

  const copyPrompt = (prompt: string, index: number) => {
    setSearchQuery(prompt)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Store search params
    const searchParams = {
      activities: selectedActivities,
      numPax,
      budget: budget[0],
      mbti,
      spicy,
      query: searchQuery,
      startDate,
      endDate,
    }

    // Navigate to loading page with search params
    const params = new URLSearchParams()
    params.set('data', JSON.stringify(searchParams))
    router.push(`/loading?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-8">
      {/* Activity Type */}
      <div className="space-y-3">
        <label className="text-sm font-medium block">
          Activity Type <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {activityTypes.map((activity) => (
            <Badge
              key={activity}
              variant={selectedActivities.includes(activity) ? "default" : "outline"}
              className="cursor-pointer px-4 py-2 text-sm hover:opacity-80 transition-opacity"
              onClick={() => toggleActivity(activity)}
            >
              {activity}
            </Badge>
          ))}
        </div>
      </div>

      {/* Number of Pax and MBTI - Side by side on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <label htmlFor="numPax" className="text-sm font-medium block">
            Number of Pax <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <Input
            id="numPax"
            type="number"
            min="1"
            placeholder="e.g., 2"
            value={numPax}
            onChange={(e) => setNumPax(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <label htmlFor="mbti" className="text-sm font-medium block">
            MBTI <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <Select value={mbti} onValueChange={setMbti}>
            <SelectTrigger id="mbti">
              <SelectValue placeholder="Select your MBTI" />
            </SelectTrigger>
            <SelectContent>
              {mbtiTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Budget Slider */}
      <div className="space-y-3">
        <label className="text-sm font-medium block">
          Budget <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <div className="px-2">
          <Slider
            value={budget}
            onValueChange={setBudget}
            max={4}
            step={1}
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-4">
            {budgetLabels.map((label, idx) => (
              <span
                key={label}
                className={budget[0] === idx ? "text-primary font-semibold" : ""}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <label htmlFor="startDate" className="text-sm font-medium block">
            Start Date <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <label htmlFor="endDate" className="text-sm font-medium block">
            End Date <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Spicy Option */}
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <label htmlFor="spicy" className="text-sm font-medium block">
            Spicy Option 🌶️
          </label>
          <p className="text-xs text-muted-foreground mt-1">
            Include drinks & nightlife recommendations
          </p>
        </div>
        <Switch id="spicy" checked={spicy} onCheckedChange={setSpicy} />
      </div>

      {/* Sample Prompts */}
      <div className="space-y-3">
        <label className="text-sm font-medium block">
          Sample Prompts
        </label>
        <div className="grid grid-cols-1 gap-2">
          {samplePrompts.map((prompt, index) => (
            <Card
              key={index}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => copyPrompt(prompt, index)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <p className="text-sm flex-1">{prompt}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="ml-2 shrink-0"
                >
                  {copiedIndex === index ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Search Input */}
      <div className="space-y-3">
        <label htmlFor="searchQuery" className="text-sm font-medium block">
          What's on your mind? <span className="text-destructive">*</span>
        </label>
        <div className="flex gap-2">
          <Input
            id="searchQuery"
            type="text"
            placeholder="so what's on your mind for this weekend"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
            required
          />
          <Button type="submit" size="icon" className="shrink-0">
            <ArrowRight className="h-5 w-5" />
            <span className="sr-only">Generate activities</span>
          </Button>
        </div>
      </div>
    </form>
  )
}

