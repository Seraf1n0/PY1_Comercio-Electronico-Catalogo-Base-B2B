import { useEffect, useRef, useState } from "react";

export default function FeedbackAlert({
  mensaje,
  trigger,
  duration = 3000,
}: {
  mensaje: string;
  trigger: number;
  duration?: number;
}) {
  const [dismissedTrigger, setDismissedTrigger] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (trigger === 0) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setDismissedTrigger(trigger);
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [trigger, duration]);

  const visible = trigger !== 0 && dismissedTrigger !== trigger;

  if (!visible) return null;

  return (
    <div className="fixed bottom-40 left-1/2 z-40 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 lg:bottom-6">
      <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">
        <span className="truncate">{mensaje}</span>
      </div>
    </div>
  );
}