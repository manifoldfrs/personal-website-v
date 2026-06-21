export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="mb-3 h-3 w-32 rounded bg-secondary" />
      <div className="mb-10 h-10 w-3/4 rounded bg-secondary" />
      <div className="space-y-3">
        <div className="h-4 w-full rounded bg-secondary" />
        <div className="h-4 w-full rounded bg-secondary" />
        <div className="h-4 w-5/6 rounded bg-secondary" />
        <div className="h-4 w-11/12 rounded bg-secondary" />
      </div>
    </div>
  )
}
