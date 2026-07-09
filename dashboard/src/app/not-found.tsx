import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center px-4">
      <div className="max-w-md">
        <h1 className="text-6xl font-bold text-zinc-700">404</h1>
        <p className="mt-4 text-lg text-zinc-400">
          This page does not exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
