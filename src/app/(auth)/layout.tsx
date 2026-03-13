export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 p-6">
            <div className="w-full max-w-sm">
                {children}
            </div>
        </div>
    )
}
