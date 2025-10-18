import { atom } from "jotai";
import { createClient } from "@/lib/supabase";

export interface HistoryItem {
  id: string;
  query: string;
  created_at: string;
}

export interface FullHistoryItem extends HistoryItem {
  activities: string[];
  budget: number;
  num_pax: string;
  mbti?: string;
  spicy?: number;
  itinerary_data: {
    activities: any[];
  };
}

// Base atom for recent history items (sidebar)
export const historyItemsAtom = atom<HistoryItem[]>([]);

// Full history atom (history page)
export const fullHistoryAtom = atom<FullHistoryItem[]>([]);

// Loading state atom
export const historyLoadingAtom = atom<boolean>(false);

// Error state atom
export const historyErrorAtom = atom<string | null>(null);

// User atom
export const userAtom = atom<any>(null);

// Action atom to fetch history
export const fetchHistoryAtom = atom(null, async (get, set) => {
  set(historyLoadingAtom, true);
  set(historyErrorAtom, null);

  try {
    const supabaseClient = createClient();
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      set(historyItemsAtom, []);
      set(userAtom, null);
      set(historyLoadingAtom, false);
      return;
    }

    set(userAtom, user);

    const { data, error } = await supabaseClient
      .from("itineraries")
      .select("id, query, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3);

    if (error) {
      console.error("Error fetching history:", error);
      set(historyErrorAtom, error.message);
      set(historyItemsAtom, []);
    } else {
      set(historyItemsAtom, data || []);
    }
  } catch (err) {
    console.error("Error:", err);
    set(historyErrorAtom, err instanceof Error ? err.message : "Unknown error");
    set(historyItemsAtom, []);
  } finally {
    set(historyLoadingAtom, false);
  }
});

// Action atom to add a new history item
export const addHistoryItemAtom = atom(
  null,
  (get, set, newItem: HistoryItem) => {
    const currentItems = get(historyItemsAtom);
    // Add to the beginning and keep only the latest 3
    const updatedItems = [newItem, ...currentItems].slice(0, 3);
    set(historyItemsAtom, updatedItems);
  }
);

// Action atom to fetch full history (for history page)
export const fetchFullHistoryAtom = atom(null, async (get, set) => {
  set(historyLoadingAtom, true);
  set(historyErrorAtom, null);

  try {
    const supabaseClient = createClient();
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      set(fullHistoryAtom, []);
      set(userAtom, null);
      set(historyLoadingAtom, false);
      return;
    }

    set(userAtom, user);

    const { data, error } = await supabaseClient
      .from("itineraries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching full history:", error);
      set(historyErrorAtom, error.message);
      set(fullHistoryAtom, []);
    } else {
      set(fullHistoryAtom, (data as FullHistoryItem[]) || []);
    }
  } catch (err) {
    console.error("Error:", err);
    set(historyErrorAtom, err instanceof Error ? err.message : "Unknown error");
    set(fullHistoryAtom, []);
  } finally {
    set(historyLoadingAtom, false);
  }
});

// Action atom to clear history
export const clearHistoryAtom = atom(null, (get, set) => {
  set(historyItemsAtom, []);
  set(fullHistoryAtom, []);
  set(historyErrorAtom, null);
});
