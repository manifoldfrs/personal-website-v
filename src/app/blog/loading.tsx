export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="mb-10 h-5 w-3/4 rounded bg-secondary" />
      <div className="divide-y divide-border border-y border-border">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-4">
            <div className="h-5 w-2/3 rounded bg-secondary" />
            <div className="h-3 w-20 rounded bg-secondary" />
          </div>
        ))}
      </div>
    </div>
  )
}
