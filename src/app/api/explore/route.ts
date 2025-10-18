import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Fetch public itineraries with user profile information
    const { data: itineraries, error } = await supabase
      .from("itineraries")
      .select(
        `
        id,
        query,
        created_at,
        activities,
        budget,
        num_pax,
        mbti,
        spicy,
        itinerary_data,
        user_id
      `
      )
      .eq("public", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching public itineraries:", error);
      return NextResponse.json(
        { error: "Failed to fetch public itineraries" },
        { status: 500 }
      );
    }

    if (!itineraries || itineraries.length === 0) {
      return NextResponse.json([]);
    }

    // For now, we'll add a placeholder user profile since we can't access auth.users from client side
    // In a production app, you might want to create a separate profiles table
    const publicItineraries = itineraries.map((itinerary) => ({
      ...itinerary,
      user_profile: {
        user_id: itinerary.user_id,
        avatar_url: null,
        full_name: "Anonymous User",
        name: "Anonymous User",
      },
    }));

    return NextResponse.json(publicItineraries);
  } catch (error) {
    console.error("Error in explore API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
