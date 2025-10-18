import { getDefaultStore } from "jotai";
import { addHistoryItemAtom, fetchHistoryAtom, historyItemsAtom } from "../atoms";
import { HistoryItem } from "../atoms";

const store = getDefaultStore();

/**
 * Add a new history item to the global state
 * This can be called from anywhere in the app when a new itinerary is created
 */
export function addHistoryItemToStore(historyItem: HistoryItem) {
  store.set(addHistoryItemAtom, historyItem);
}

/**
 * Refresh the history data from the server
 * This can be called when you want to ensure the latest data is loaded
 */
export function refreshHistoryFromStore() {
  store.set(fetchHistoryAtom);
}

/**
 * Get the current history items from the store
 * Useful for server-side operations or when you need to access the current state
 */
export function getCurrentHistoryFromStore() {
  return store.get(historyItemsAtom);
}
