import Link from 'next/link'

export default function LandingPage() {
    return (
        <div className="flex flex-col max-w-2xl px-6 py-20 mx-auto text-center items-center h-full">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-neutral-900 mb-6 !leading-tight">
                PM Tool MVP for Software Teams
            </h1>
            <p className="text-lg md:text-xl text-neutral-600 mb-10 max-w-xl">
                A production-grade project management tool built to simplify collaboration and tracking.
            </p>

            <div className="flex items-center gap-4 flex-wrap justify-center">
                <Link
                    href="/login"
                    className="inline-flex h-12 items-center justify-center rounded-lg bg-neutral-900 px-8 text-sm font-medium text-white hover:bg-neutral-900/90"
                >
                    Log In
                </Link>
                <Link
                    href="/signup"
                    className="inline-flex h-12 items-center justify-center rounded-lg border border-neutral-200 bg-white px-8 text-sm font-medium hover:bg-neutral-100 hover:text-neutral-900"
                >
                    Sign Up
                </Link>
            </div>
        </div>
    )
}
