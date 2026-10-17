export default function ProductCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200"
    >
      <div className="skeleton aspect-[4/3] w-full rounded-lg" />
      <div className="skeleton mt-3 h-3 w-20 rounded" />
      <div className="skeleton mt-2 h-4 w-full rounded" />
      <div className="skeleton mt-2 h-4 w-2/3 rounded" />
      <div className="skeleton mt-3 h-5 w-24 rounded" />
      <div className="skeleton mt-3 h-9 w-full rounded" />
    </div>
  );
}
