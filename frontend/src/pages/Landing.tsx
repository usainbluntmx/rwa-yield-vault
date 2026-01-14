export default function Landing() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-5 sm:px-6 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(75,43,238,0.15),transparent_70%)] pointer-events-none" />

            <div className="relative z-10 w-full max-w-3xl flex flex-col items-center gap-6 sm:gap-8">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    Active on Mantle Network
                </div>

                {/* Title */}
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-tight md:leading-[1.1]">
                    Enter the <span className="text-primary">RWA</span> Future
                </h1>

                {/* Subtitle */}
                <p className="text-base sm:text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-xl font-light px-2">
                    Get a return on your assets easily, quickly, and securely.
                </p>

                {/* Hint */}
                <p className="text-xs sm:text-sm text-slate-400 mt-4 sm:mt-6">
                    Connect your wallet to continue
                </p>
            </div>
        </div>
    )
}
