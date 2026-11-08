// Compatibilidad: el historial ahora vive en analytics/historyStore.
export {
  MAX_RECENT_PRODUCTS,
  MAX_RECENT_SEARCHES,
  clearHistory,
  loadHistory,
  loadRecentSearches,
  loadRecentlyViewedProducts,
  recordProductView,
  recordSearch,
} from "../analytics/historyStore";
