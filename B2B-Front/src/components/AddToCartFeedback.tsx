import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { FeedbackContext } from "./cartFeedbackContext";

export function CartFeedbackProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const notify = useCallback((nextMessage: string) => {
    setMessage(nextMessage);
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => setMessage(null), 2000);
  }, []);

  useEffect(
    () => () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    },
    []
  );

  return (
    <FeedbackContext.Provider value={{ notify }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed bottom-6 left-1/2 z-50 w-full max-w-xs -translate-x-1/2 px-4"
      >
        {message && (
          <div className="rounded-lg bg-slate-900 px-4 py-2 text-center text-sm font-medium text-white shadow-lg">
            {message}
          </div>
        )}
      </div>
    </FeedbackContext.Provider>
  );
}
