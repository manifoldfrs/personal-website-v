export default function Loading() {
  return (
    <div className="min-h-screen pt-32 px-8 md:px-12">
      <div className="animate-pulse space-y-8">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-t border-white/10 py-8">
            <div className="h-4 w-24 bg-secondary rounded mb-4" />
            <div className="h-8 w-3/4 bg-secondary rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
