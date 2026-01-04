export default function Loading() {
  return (
    <div className="min-h-screen pt-32 px-8 md:px-12">
      <div className="max-w-3xl mx-auto animate-pulse space-y-4">
        <div className="h-4 w-32 bg-secondary rounded" />
        <div className="h-12 w-3/4 bg-secondary rounded" />
        <div className="space-y-2 mt-16">
          <div className="h-4 bg-secondary rounded" />
          <div className="h-4 bg-secondary rounded" />
          <div className="h-4 w-5/6 bg-secondary rounded" />
        </div>
      </div>
    </div>
  )
}
