"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Copy, Check, Send } from "lucide-react"
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
import Image from "next/image"
import TelegramLogo from "@/app/assets/telegram-app-48.png"
import InstagramLogo from "@/app/assets/instagram-48.png"
import Lemon8Logo from "@/app/assets/Lemon8.png"
import TiktokLogo from "@/app/assets/tiktok-48.png"

const activityTypes = [
    "Outdoor",
    "Indoors",
    "Sports",
    "Shopping",
    "Cafes",
    "Museums",
    "Thrift Store",
    "Artsy",
    "Games",
]

const paxOptions = [
    { value: "solo", label: "Solo" },
    { value: "date", label: "Date" },
    { value: "double-date", label: "Double Date" },
    { value: "3-5", label: "3-5" },
    { value: "6-7", label: "6-7" },
    { value: "8+", label: "8+" },
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

// Map slider percentage to budget categories
const getBudgetCategory = (percentage: number): number => {
    if (percentage <= 20) return 0 // Broke Student
    if (percentage <= 40) return 1 // Budget-Friendly
    if (percentage <= 60) return 2 // Moderate
    if (percentage <= 80) return 3 // Comfortable
    return 4 // Atas Boss
}

// Map pax option to numeric value or string range
const getPaxValue = (paxOption: string): string | number => {
    switch (paxOption) {
        case "solo":
            return 1
        case "date":
            return 2
        case "double-date":
            return 4
        default:
            return paxOption // Keep string ranges like "3-5", "6-7", "8+"
    }
}

export function FilterOptions() {
    const router = useRouter()
    const [selectedActivities, setSelectedActivities] = useState<string[]>([])
    const [numPax, setNumPax] = useState("")
    const [budget, setBudget] = useState([50]) // 0-100 percentage
    const [mbti, setMbti] = useState("")
    const [spicy, setSpicy] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

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

        // Store search params with budget and numPax mapped to correct values
        const searchParams = {
            activities: selectedActivities,
            numPax: numPax ? getPaxValue(numPax) : undefined,
            budget: getBudgetCategory(budget[0]),
            mbti,
            spicy,
            query: searchQuery,
        }

        // Navigate to loading page with search params
        const params = new URLSearchParams()
        params.set('data', JSON.stringify(searchParams))
        router.push(`/loading?${params.toString()}`)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 pb-8">
            <div className="text-center">
                <h2 className="font-serif text-2xl md:text-3xl text-primary">
                    What&apos;s on your mind for this weekend?
                </h2>
            </div>
            {/* Preference Selectors Container */}
            <div className="max-w-2xl mx-auto border border-primary/30 rounded-lg p-4 space-y-4">
                {/* Two Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Activity Type + Number of Pax */}
                    <div className="space-y-4">
                        {/* Activity Type */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-medium block">
                                Activity Type
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                                {activityTypes.map((activity) => (
                                    <Badge
                                        key={activity}
                                        variant={selectedActivities.includes(activity) ? "default" : "outline"}
                                        className="cursor-pointer px-2.5 py-0.5 text-[10px] border select-none"
                                        onClick={() => toggleActivity(activity)}
                                    >
                                        {activity}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Number of Pax */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-medium block">
                                Number of Pax
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                                {paxOptions.map((option) => (
                                    <Badge
                                        key={option.value}
                                        variant={numPax === option.value ? "default" : "outline"}
                                        className="cursor-pointer px-2.5 py-0.5 text-[10px] border select-none"
                                        onClick={() => setNumPax(option.value)}
                                    >
                                        {option.label}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Budget + MBTI + Spicy */}
                    <div className="space-y-4">
                        {/* Budget Slider */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-medium block">
                                Budget
                            </label>
                            <div className="px-2">
                                <Slider
                                    value={budget}
                                    onValueChange={setBudget}
                                    max={100}
                                    step={1}
                                    className="mb-2 cursor-pointer"
                                />
                                <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                                    <span>Broke (&lt;$30)</span>
                                    <span>Baller ($100+)</span>
                                </div>
                            </div>
                        </div>

                        {/* MBTI */}
                        <div className="space-y-2">
                            <Select value={mbti} onValueChange={setMbti}>
                                <SelectTrigger id="mbti" className="h-8 text-xs">
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

                        {/* Spicy Option */}
                        <div className="flex items-center justify-between p-2.5 border-2 border-primary/30 rounded-lg">
                            <div>
                                <label htmlFor="spicy" className="text-[10px] font-medium block">
                                    Spicy Option 🌶️
                                </label>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                    Include drinks & nightlife
                                </p>
                            </div>
                            <Switch id="spicy" checked={spicy} onCheckedChange={setSpicy} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Search Input */}
            <div className="space-y-3">
                <Card className="relative">
                    <CardContent className="p-0">
                        <textarea
                            id="searchQuery"
                            placeholder="Describe your ideal activity..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full min-h-[200px] p-6 pb-20 bg-transparent border-none focus:outline-none focus:ring-0 resize-none text-base"
                            required
                        />
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Sources:</span>
                                <div className="flex gap-2">
                                    <div className="relative w-6 h-6 rounded-full overflow-hidden">
                                        <Image
                                            src={TelegramLogo}
                                            alt="Telegram"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="relative w-6 h-6 rounded-full overflow-hidden">
                                        <Image
                                            src={InstagramLogo}
                                            alt="Instagram"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="relative w-6 h-6 rounded-full overflow-hidden">
                                        <Image
                                            src={Lemon8Logo}
                                            alt="Lemon8"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="relative w-6 h-6 rounded-full overflow-hidden">
                                        <Image
                                            src={TiktokLogo}
                                            alt="TikTok"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </div>
                            </div>
                            <Button type="submit" size="icon" className="h-10 w-10">
                                <ArrowRight className="h-5 w-5" />
                                <span className="sr-only">Generate activities</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Sample Prompts */}
            <div className="space-y-2 max-w-2xl mx-auto">
                <div className="rounded-lg animate-pulse-border">
                    <Card className="border-0">
                        <CardContent className="p-2 space-y-1">
                            {samplePrompts.map((prompt, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between py-1 px-2 rounded-md cursor-pointer hover:bg-primary/5 transition-colors"
                                    onClick={() => copyPrompt(prompt, index)}
                                >
                                    <p className={`text-[10px] flex-1 transition-colors duration-300 ${
                                        copiedIndex === index ? 'text-green-600' : ''
                                    }`}>
                                        {prompt}
                                    </p>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="ml-2 shrink-0 h-5 w-5"
                                    >
                                        {copiedIndex === index ? (
                                            <Check className="h-3 w-3 text-green-600" />
                                        ) : (
                                            <Copy className="h-3 w-3" />
                                        )}
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    )
}

