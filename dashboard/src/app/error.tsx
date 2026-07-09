"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center px-4">
      <div className="max-w-md">
        <h1 className="text-4xl font-bold text-red-500">Something went wrong</h1>
        <p className="mt-4 text-zinc-400">
          {error.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
