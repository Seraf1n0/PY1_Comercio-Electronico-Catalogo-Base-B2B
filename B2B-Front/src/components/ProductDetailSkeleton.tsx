export default function ProductDetailSkeleton() {
  return (
    <div aria-hidden="true" className="mx-auto max-w-4xl px-4 py-6">
      <div className="skeleton h-6 w-48 rounded" />

      <div className="mt-6 flex flex-col gap-6 md:flex-row">
        <div className="min-w-0 flex-1">
          <div className="skeleton aspect-[4/3] w-full rounded-xl" />
        </div>

        <div className="w-full rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 md:w-64">
          <div className="skeleton h-5 w-40 rounded" />
          <div className="skeleton mt-2 h-4 w-32 rounded" />
          <div className="skeleton mt-4 h-10 w-full rounded" />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 rounded-xl bg-slate-100 p-4 md:grid-cols-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="skeleton h-4 w-full rounded" />
        ))}
      </div>
    </div>
  );
}
