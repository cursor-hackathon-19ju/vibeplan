import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  historyItemsAtom,
  fullHistoryAtom,
  userAtom,
  fetchHistoryAtom,
  fetchFullHistoryAtom,
  addHistoryItemAtom,
  clearHistoryAtom,
  historyLoadingAtom,
  historyErrorAtom,
} from "../atoms";

export function useHistory() {
  const [historyItems] = useAtom(historyItemsAtom);
  const [user] = useAtom(userAtom);
  const [loading] = useAtom(historyLoadingAtom);
  const [error] = useAtom(historyErrorAtom);

  const fetchHistory = useSetAtom(fetchHistoryAtom);
  const addHistoryItem = useSetAtom(addHistoryItemAtom);
  const clearHistory = useSetAtom(clearHistoryAtom);

  return {
    historyItems,
    user,
    loading,
    error,
    fetchHistory,
    addHistoryItem,
    clearHistory,
  };
}

export function useFullHistory() {
  const [fullHistory] = useAtom(fullHistoryAtom);
  const [user] = useAtom(userAtom);
  const [loading] = useAtom(historyLoadingAtom);
  const [error] = useAtom(historyErrorAtom);

  const fetchFullHistory = useSetAtom(fetchFullHistoryAtom);
  const clearHistory = useSetAtom(clearHistoryAtom);

  return {
    fullHistory,
    user,
    loading,
    error,
    fetchFullHistory,
    clearHistory,
  };
}
