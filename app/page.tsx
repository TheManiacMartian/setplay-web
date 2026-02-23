import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-5xl font-black tracking-tight">Setplay</h1>
      <p className="text-lg text-gray-500 max-w-md">
        Dynamic streaming overlays for Super Smash Bros. Ultimate tournament organizers.
      </p>
      <div className="flex gap-3">
        <Link
          href="/signup"
          className="bg-black text-white font-medium px-6 py-3 rounded-lg hover:bg-gray-800"
        >
          Get Started
        </Link>
        <Link
          href="/login"
          className="border font-medium px-6 py-3 rounded-lg hover:bg-gray-50"
        >
          Sign In
        </Link>
      </div>
    </main>
  )
}
