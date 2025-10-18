"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Search, User } from "lucide-react";

const budgetLabels = [
  "Broke Student",
  "Budget-Friendly",
  "Moderate",
  "Comfortable",
  "Atas Boss",
];

interface PublicItinerary {
  id: string;
  query: string;
  created_at: string;
  activities: string[];
  budget: number;
  num_pax: string;
  mbti?: string;
  spicy?: boolean;
  itinerary_data: {
    activities: any[];
  };
  user_profile: {
    user_id: string;
    avatar_url?: string;
    full_name?: string;
    name?: string;
  };
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffWeeks === 1) return "1 week ago";
  if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
  if (diffMonths === 1) return "1 month ago";
  return `${diffMonths} months ago`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ExplorePage() {
  const [publicItineraries, setPublicItineraries] = useState<PublicItinerary[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicItineraries = async () => {
      try {
        const response = await fetch("/api/explore");
        if (!response.ok) {
          throw new Error("Failed to fetch public itineraries");
        }
        const data = await response.json();
        setPublicItineraries(data);
      } catch (err) {
        console.error("Error fetching public itineraries:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchPublicItineraries();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <MobileNav />
          <main className="container max-w-4xl mx-auto p-6 md:p-8">
            <p>Loading public itineraries...</p>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <MobileNav />
          <main className="container max-w-4xl mx-auto p-6 md:p-8">
            <p className="text-red-500">{error}</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1">
        <MobileNav />

        <main className="container max-w-4xl mx-auto p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-serif italic mb-2">
              Explore
            </h1>
            <p className="text-muted-foreground text-lg">
              Discover amazing itineraries shared by the community
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {publicItineraries.map((item) => (
              <Link key={item.id} href={`/results?id=${item.id}`}>
                <Card className="hover:border-cyan-400 transition-all cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-medium font-sans mb-2">
                          {item.query || "Untitled itinerary"}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {formatTimeAgo(item.created_at)} •{" "}
                          {formatDate(item.created_at)}
                        </CardDescription>
                      </div>

                      {/* User Profile */}
                      <div className="flex items-center gap-2 ml-4">
                        {item.user_profile?.avatar_url ? (
                          <img
                            src={item.user_profile.avatar_url}
                            alt="Profile"
                            className="w-8 h-8 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold">
                            <User className="h-4 w-4" />
                          </div>
                        )}
                        <span className="text-sm font-medium text-muted-foreground">
                          {item.user_profile?.full_name ||
                            item.user_profile?.name ||
                            "Anonymous"}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Filters Used */}
                      <div className="flex flex-wrap gap-2">
                        {item.activities.map((activity) => (
                          <Badge key={activity} variant="secondary">
                            {activity}
                          </Badge>
                        ))}
                        {item.budget !== undefined && (
                          <Badge variant="outline">
                            {budgetLabels[item.budget]}
                          </Badge>
                        )}
                        {item.num_pax && (
                          <Badge variant="outline">{item.num_pax} pax</Badge>
                        )}
                        {item.mbti && (
                          <Badge variant="outline">{item.mbti}</Badge>
                        )}
                      </div>

                      {/* Results Count */}
                      <p className="text-sm text-muted-foreground">
                        Found {item.itinerary_data?.activities?.length || 0}{" "}
                        activities
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

            {publicItineraries.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Search className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">
                    No public itineraries yet
                  </p>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Be the first to share your amazing itinerary with the
                    community
                  </p>
                  <Button asChild>
                    <a href="/">Create Your First Itinerary</a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
