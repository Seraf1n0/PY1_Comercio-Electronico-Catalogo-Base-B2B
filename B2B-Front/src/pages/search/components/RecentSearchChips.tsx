import { useEffect, useState } from "react";
import { useSearchBox } from "react-instantsearch";
import { useAuth } from "../../../auth/useAuth";
import {
  loadRecentSearches,
  RECENT_SEARCHES_UPDATED_EVENT,
} from "../../../analytics/historyStore";

export default function RecentSearchChips() {
  const { user } = useAuth();
  const userId = user?.objectID;
  const { refine } = useSearchBox();
  const [, setRevision] = useState(0);
  const recentSearches = userId ? loadRecentSearches(userId) : [];

  useEffect(() => {
    if (!userId) return;

    const handleUpdate = (event: Event) => {
      const updatedUserId = (event as CustomEvent<{ userId: string }>).detail?.userId;
      if (updatedUserId === userId) {
        setRevision((revision) => revision + 1);
      }
    };

    window.addEventListener(RECENT_SEARCHES_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(RECENT_SEARCHES_UPDATED_EVENT, handleUpdate);
  }, [userId]);

  if (recentSearches.length === 0) return null;

  return (
    <section className="flex flex-wrap items-center gap-2" aria-label="Búsquedas recientes">
      <span className="mr-1 text-sm font-medium text-slate-500">
        Búsquedas recientes:
      </span>
      {recentSearches.map((query) => (
        <button
          key={query.toLocaleLowerCase()}
          type="button"
          onClick={() => refine(query)}
          aria-label={`Buscar ${query} otra vez`}
          className="rounded-full bg-indigo-50 px-3 py-1.5 text-sm text-indigo-700 transition hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          {query}
        </button>
      ))}
    </section>
  );
}
