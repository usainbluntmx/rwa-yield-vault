export default function Landing() {
    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* BACKGROUND MESH */}
            <div className="absolute inset-0 bg-[radial-gradient(at_0%_0%,rgba(75,43,238,0.15),transparent_50%),radial-gradient(at_100%_100%,rgba(26,11,59,0.4),transparent_50%),radial-gradient(at_50%_50%,rgba(75,43,238,0.05),transparent_50%)] pointer-events-none" />

            {/* GRID OVERLAY */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            {/* HERO */}
            <main className="relative z-10 flex flex-col items-center justify-center px-4 sm:px-6 pt-32 pb-24 text-center">
                {/* BADGE */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-8">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    Live on Mantle Network
                </div>

                {/* TITLE */}
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-tight md:leading-[1.1] max-w-4xl">
                    A Smarter Way to Earn Yield on{" "}
                    <span className="text-primary">Real-World Assets</span>
                </h1>

                {/* SUBTITLE */}
                <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl">
                    A non-custodial DeFi vault designed to generate yield from
                    stablecoins and tokenized stocks — fully on-chain, transparent,
                    and built for the next generation of finance.
                </p>

                {/* INFO CARDS */}
                <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl w-full">
                    <div className="glass rounded-xl p-6 text-left">
                        <h3 className="font-bold mb-2">Stablecoin Yield</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Deposit stable assets into ERC-4626 compliant vaults
                            and earn yield through automated on-chain strategies.
                        </p>
                    </div>

                    <div className="glass rounded-xl p-6 text-left">
                        <h3 className="font-bold mb-2">Tokenized Stocks</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Gain exposure to real-world equities like Apple,
                            Tesla, and NVIDIA through on-chain tokenized assets.
                        </p>
                    </div>

                    <div className="glass rounded-xl p-6 text-left">
                        <h3 className="font-bold mb-2">Fully Non-Custodial</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            You remain in full control of your funds at all times.
                            All actions are executed directly from your wallet.
                        </p>
                    </div>
                </div>

                {/* SECONDARY MESSAGE */}
                <p className="mt-16 text-xs sm:text-sm text-slate-400">
                    Connect your wallet to access the vaults and start earning.
                </p>
            </main>
        </div>
    )
}
